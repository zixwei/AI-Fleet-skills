"""The generation part of a remake: which shots a video model makes and how they are fed to it.

Three inputs, kept apart:
  - the breakdown: the source's shots, scenes and timing (facts, the same whatever model is used)
  - the remake intent (remake/intent.yaml, filled in with the user): the model, whether every shot is generated or only
    the ones the source generated, and what is swapped for what (people, animals, products), with images where given
  - the model's limits from the capability map: seconds per call, shots per call, reference video / images it takes

One packer turns them into generation units. The feed is chosen from what the model takes, best first:
  remix      the source stretch as reference video; the model copies cuts, camera and pacing
  keyframes  no reference video but several shots and images per call: one source frame per shot fixes composition
  frames     one shot per call from its first (and last) frame
  text       prompt only
and consecutive shots go into as few calls as the limits allow (a long stretch is cut where the scene changes).

Prompts come in two layers: a brief per unit (what each shot is in the source, what changes, which image is which) with a
generic draft, and the final prompt the agent writes for the model's own format (remake/prompts.json). `checks()` reports
what would go wrong before anything is paid for: images or reference seconds over the limit, very short units, too many
calls, swaps with nothing to show them, prompts that break the model's format.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

from . import performance
from .classify import LABEL_ZH
from .i18n import T, join, lang, model_name, semi, shot_ids
from .plan import framing_words, shot_prompts, with_acting

REF_CLIP_S = 15.0  # one reference video: Seedance / Kling take clips up to about 15 s each
SHORT_UNIT_S = 3.0  # a call this short on its own is unstable and wasteful
CALLS_PER_MIN = 12  # more calls than this per generated minute: the plan is cutting too finely
UNKNOWN_IMAGES = 4  # a model that takes reference images without a stated limit is planned for this many

GEN_LABELS = ("ai_video", "cg_3d", "anim_2d")
# generate = all: filmed and clipped shots are generated too (the user swaps people / products and remakes it by model);
# code, screen and still inserts are still built locally
ALL_GEN_LABELS = GEN_LABELS + ("live_action", "stop_motion", "film_footage", "avatar")
INSERT_LABELS = ("code_render", "screen_capture", "still_motion", "static_hold")
INTENT_FILE = Path("remake") / "intent.yaml"
PROMPTS_FILE = Path("remake") / "prompts.json"

STRATEGY_ZH = {"remix": ("参考原片改写", "remix of the source"), "keyframes": ("关键帧参考多镜头", "multi-shot from source keyframes"),
               "frames": ("首帧 / 首尾帧逐镜", "first / last frame, shot by shot"), "text": ("文生视频", "text to video")}


def strategy_name(s: str) -> str:
    zh, en = STRATEGY_ZH.get(s, (s, s))
    return T(zh, en)


# ---------------------------------------------------------------- intent
def clean_intent(d) -> dict:
    """The intent as the planner reads it; anything malformed is dropped, not guessed."""
    d = d if isinstance(d, dict) else {}
    out: dict = {"generate": "all" if str(d.get("generate", "ai")).strip().lower() == "all" else "ai", "swaps": []}
    if isinstance(d.get("model"), str) and d["model"].strip():
        out["model"] = d["model"].strip()
    for s in d.get("swaps") or []:
        if not isinstance(s, dict) or not (s.get("to") or s.get("image")):
            continue
        img = s.get("image")
        img = str(Path(img).expanduser().resolve()) if isinstance(img, str) and img.strip() else None
        out["swaps"].append({"from": str(s.get("from") or "").strip(), "to": str(s.get("to") or "").strip(), "image": img})
    if d.get("notes"):
        out["notes"] = str(d["notes"]).strip()
    return out


def load_intent(out: Path) -> dict:
    p = Path(out) / INTENT_FILE
    if not p.is_file():
        return clean_intent({})
    try:
        return clean_intent(yaml.safe_load(p.read_text(encoding="utf-8")))
    except yaml.YAMLError as exc:
        return {**clean_intent({}), "error": str(exc)[:200]}


def save_intent(out: Path, intent: dict) -> Path:
    p = Path(out) / INTENT_FILE
    p.parent.mkdir(parents=True, exist_ok=True)
    keep = {k: v for k, v in intent.items() if k in ("model", "generate", "swaps", "notes") and v not in (None, "", [])}
    p.write_text(yaml.safe_dump(keep, allow_unicode=True, sort_keys=False), encoding="utf-8")
    return p


def load_prompts(out: Path) -> dict[str, str]:
    """remake/prompts.json: {"G1": "<final prompt>"}, written for the chosen model's own format."""
    p = Path(out) / PROMPTS_FILE
    try:
        got = json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}
    except (OSError, ValueError):
        return {}
    return {k: v for k, v in got.items() if isinstance(v, str) and v.strip()} if isinstance(got, dict) else {}


# ---------------------------------------------------------------- what the model takes
def spec_of(model: dict | None) -> dict:
    m = model or {}
    lim, prim = m.get("limits") or {}, set(m.get("primitives") or [])
    d, refs = lim.get("duration_s") or {}, lim.get("refs") or {}
    rv = (lim.get("ref_video_s") or {}).get("max")
    multi_ref = "video.multi_reference" in prim
    return {"max": float(d.get("max") or 10), "min": float(d.get("min") or 0),
            "multi_shot": "video.multi_shot" in prim, "shots": int(lim.get("shots_per_generation") or 0) or None,
            "ref_video": "video.reference_video" in prim, "ref_videos": int(refs.get("video") or 1),
            "ref_total": float(rv) if rv else REF_CLIP_S * max(1, int(refs.get("video") or 1)),
            "multi_ref": multi_ref, "images": int(refs.get("image") or (UNKNOWN_IMAGES if multi_ref else 0)),
            "images_stated": bool(refs.get("image")),
            "first": "video.i2v_first_frame" in prim, "last": "video.i2v_first_last" in prim,
            "exclusive": bool(lim.get("exclusive_inputs")), "native_audio": bool((m.get("audio") or {}).get("native"))}


def choose_strategy(spec: dict, n_own: int) -> str:
    if spec["ref_video"]:
        return "remix"
    if spec["multi_shot"] and spec["multi_ref"] and spec["images"] >= n_own + 2:
        return "keyframes"
    if spec["first"]:
        return "frames"
    return "text"


# ---------------------------------------------------------------- packing
def runs(shots: list[dict], labels: tuple, skip: set[int], joinable_inserts: bool) -> list[list[dict]]:
    """Stretches of consecutive shots to generate. Inserts made elsewhere (code, screen, stills, a clip reused from
    another unit) do not break a stretch when the strategy can carry them; anything else does."""
    out, cur = [], []
    for r in shots:
        lab = r["base"]["label"]
        if lab in labels and r["index"] not in skip:
            cur.append(r)
            continue
        if cur and joinable_inserts and (lab in INSERT_LABELS or r["index"] in skip):
            continue
        if cur:
            out.append(cur)
        cur = []
    if cur:
        out.append(cur)
    return out


def pack(run: list[dict], max_s: float, max_shots: int | None, new_scene: set[int], new_part: set[int] | None = None) -> list[list[dict]]:
    """Fewest calls within the per-call seconds and shots; where there is a choice, cut where a part of the story
    starts (a new caption card or narrative step) and at a scene change, and avoid calls shorter than SHORT_UNIT_S.
    A single shot longer than max_s stays one unit (made in parts)."""
    new_part = new_part or set()
    n = len(run)
    best = [0.0] + [float("inf")] * n
    prev = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(j - 1, -1, -1):
            seg = run[i:j]
            dur = sum(r["duration"] for r in seg)
            if len(seg) > 1 and (dur > max_s + 1e-6 or (max_shots and len(seg) > max_shots)):
                break
            # a story part (caption card, narrative step) is the stronger seam; a colour-histogram scene change the weaker
            cost = (1.0 + (0.3 if i > 0 and run[i]["index"] not in new_part else 0.0) + (0.2 if i > 0 and run[i]["index"] not in new_scene else 0.0)
                    + (0.5 if dur < SHORT_UNIT_S else 0.0))
            if best[i] + cost < best[j]:
                best[j], prev[j] = best[i] + cost, i
    out, j = [], n
    while j > 0:
        out.append(run[prev[j]:j])
        j = prev[j]
    return out[::-1]


def _ranges(seg: list[dict]) -> list[list[float]]:
    out: list[list[float]] = []
    for r in seg:
        if out and abs(out[-1][1] - r["start"]) < 1e-3:
            out[-1][1] = r["end"]
        else:
            out.append([r["start"], r["end"]])
    return [[round(a, 3), round(z, 3)] for a, z in out]


def _clips(ranges: list[list[float]], each: float) -> list[list[list[float]]]:
    """Source ranges as reference clips of at most `each` seconds."""
    clips, cur, used = [], [], 0.0
    for a, z in ranges:
        while z - a > 1e-3:
            take = min(z - a, each - used)
            cur.append([round(a, 3), round(a + take, 3)])
            used += take
            a += take
            if used >= each - 1e-3:
                clips.append(cur)
                cur, used = [], 0.0
    if cur:
        clips.append(cur)
    return clips


# ---------------------------------------------------------------- one unit
def _shot_text(r: dict) -> str:
    """What happens in the shot, in the report's language when the reader wrote it in both."""
    p = shot_prompts(r)
    if lang() == "en" and p.get("video_prompt_en"):
        return p["video_prompt_en"]
    return p.get("video_prompt") or (r.get("review") or r.get("vlm") or {}).get("description") or ""


def _brief(seg: list[dict], keyframe_tag: dict[int, str]) -> list[dict]:
    out, acc = [], 0.0
    for r in seg:
        act = performance.of(r)
        out.append({"shot": r["index"], "time": [round(r["start"], 3), round(r["end"], 3)], "at": round(acc, 3),
                    "duration": round(r["duration"], 3), "label": r["base"]["label"],
                    "source": (r.get("review") or r.get("vlm") or {}).get("description") or "",
                    "action": with_acting(_shot_text(r), act, en=lang() == "en"), "framing": framing_words(r)[0],
                    "composition": keyframe_tag.get(r["index"]), **({"acting": performance.summary(act)} if act else {})})
        acc += r["duration"]
    return out


def _draft(strategy: str, refs: list[dict], brief: list[dict], swaps_txt: list[str], style: str) -> str:
    """A generic prompt from the brief: what to keep, what changes, shot by shot. The final one is written per model."""
    vids = "".join(dict.fromkeys(r["tag"] for r in refs if r["tag"].startswith("@视频")))
    head = []
    if strategy == "remix":
        head.append(T("{v} 是原片：照它的分镜生成，镜头数、每个镜头的时长、景别、机位、运镜、动作和剪辑节奏都跟它一致，只把画面内容换成下面写的",
                      "{v} is the source: follow its shots (count, length, size, camera, movement, action and cutting rhythm) and change only what is written below", v=vids))
    elif strategy == "keyframes":
        head.append(T("按下面的镜头顺序一次生成，镜头之间硬切；每个镜头的构图、景别和机位参考对应的原片画面图",
                      "Generate the shots below in order in one go, hard cuts between them; each shot takes composition, size and camera from its source frame image"))
    head += swaps_txt
    if style:
        head.append(style)
    head.append(T("画面里不要出现字幕、文字和水印", "No subtitles, captions or watermarks in the picture"))
    lines = []
    for i, x in enumerate(brief, 1):
        text = x["action"] or T("（缺镜头描述：先看图复核补写）", "(no description: write one in the image review)")
        if strategy == "keyframes" and not x.get("composition") and x.get("framing"):
            text = x["framing"] + T("。", ". ") + text
        if x.get("composition"):
            text += T("（构图参考 {k}）", " (composition: {k})", k=x["composition"])
        if len(brief) == 1:
            lines.append(text)
        elif strategy == "remix":
            lines.append(T("镜头{i}：{t}", "Shot {i}: {t}", i=i, t=text))
        else:
            lines.append(T("镜头{i}（从 {a:.1f} 秒起）：{t}", "Shot {i} (from {a:.1f}s): {t}", i=i, a=x["at"], t=text))
    return T("。", ". ").join(h.rstrip("。.") for h in head) + T("。\n", ".\n") + "\n".join(lines)


def _inputs(strategy: str, refs: list[dict], seg: list[dict], spec: dict) -> list[dict]:
    own = [r for r in refs if r.get("user")]
    kf = [r for r in refs if r.get("keyframe")]
    vids = [r for r in refs if r["tag"].startswith("@视频")]
    out = [{"kind": "text", "need": "yes", "source": T("见下面的提示词", "see the prompt below"),
            "why": T("按这个模型的写法写最终版（remake/prompts.json）", "final version in this model's format (remake/prompts.json)")}]
    if vids:
        out.append({"kind": "ref_video", "need": "yes", "source": semi().join(f"`{r['tag']}` " + r["what"] for r in vids),
                    "why": T("模型照它出同样的镜头切换、运镜和动作，一次出完这段的镜头", "the model copies its cuts, camera and action and makes the stretch in one go")})
    if own:
        out.append({"kind": "ref_image", "need": "yes", "source": semi().join(f"`{r['tag']}` " + r["what"] for r in own),
                    "why": T("换进去的人、动物、商品，跨镜头一致", "what is swapped in, the same in every shot")})
    if kf:
        out.append({"kind": "ref_image", "need": "yes", "source": T("原片镜头 {s} 的画面（擦掉字幕）", "source frames of shots {s} (subtitles erased)",
                                                                     s="、".join(f"#{r['keyframe']}" for r in kf)),
                    "why": T("每个镜头一帧原片定构图和机位", "one source frame per shot fixes composition and camera")})
    if strategy == "frames":
        r = seg[0]
        out.append({"kind": "first_frame", "need": "yes", "source": T("原片 `{f}`（擦掉字幕；换人、换物时先照着重画）", "source `{f}` (subtitles erased; redraw it first when people or products change)",
                                                                       f=r["assets"]["first_frame"]),
                    "why": T("锁住构图、景别和主体位置", "locks composition, size and subject position")})
        moves = (r.get("features") or {}).get("camera") not in (None, "static", "unknown")
        if spec["last"] and (moves or r["duration"] >= 3):
            out.append({"kind": "last_frame", "need": "opt", "source": T("原片 `{f}`，处理同首帧", "source `{f}`, treated like the first frame", f=r["assets"]["last_frame"]),
                        "why": T("有运镜或动作时给终点，动作和落幅更接近原片", "with a move, pinning the end keeps action and final framing close to the source")})
    return out


def build_unit(seg: list[dict], k: int, strategy: str, spec: dict, own: list[dict], swaps_txt: list[str], style: str,
               model: dict | None) -> dict:
    t0, t1 = seg[0]["start"], seg[-1]["end"]
    dur = round(sum(r["duration"] for r in seg), 3)
    ranges = _ranges(seg)
    votes: dict[str, float] = {}
    for r in seg:
        votes[r["base"]["label"]] = votes.get(r["base"]["label"], 0.0) + r["duration"]
    label = max(votes.items(), key=lambda kv: kv[1])[0]
    parts = int(-(-dur // spec["max"])) if len(seg) == 1 and dur > spec["max"] + 1e-6 else 1
    refs = [dict(r) for r in own] if strategy != "frames" or not spec["exclusive"] else []
    keyframe_tag: dict[int, str] = {}
    if strategy == "remix":
        each = min(REF_CLIP_S, spec["ref_total"])
        for part in range(parts):
            a0 = t0 + dur * part / parts
            pr = [[a0, a0 + dur / parts]] if parts > 1 else ranges
            for c, rr in enumerate(_clips(pr, each), 1):
                refs.append({"tag": f"@视频{c}", "part": part + 1, "ranges": rr,
                             "what": (T("第 {k} 次：", "call {k}: ", k=part + 1) if parts > 1 else "")
                             + T("原片 {s}（擦掉字幕和贴纸）", "source {s} (subtitles and stickers erased)", s=join(f"{a:.1f}–{z:.1f}s" for a, z in rr))})
    elif strategy == "keyframes":
        # image slots left after the user's own: when they run short, the longest shots keep their source frame and the
        # rest get their framing in words (a call kept whole beats a frame for every shot when subjects have no image)
        room = max(0, spec["images"] - len(refs))
        framed = {r["index"] for r in sorted(seg, key=lambda r: -r["duration"])[:room]}
        for r in seg:
            if r["index"] not in framed:
                continue
            tag = f"@图片{sum(1 for x in refs if x['tag'].startswith('@图片')) + 1}"
            keyframe_tag[r["index"]] = tag
            refs.append({"tag": tag, "keyframe": r["index"], "t": round(r["start"] + min(0.3, r["duration"] / 2), 3),
                         "what": T("原片镜头 #{i} 的画面（擦掉字幕）：只参考构图、景别和机位", "source shot #{i} (subtitles erased): composition, size and camera only", i=r["index"])})
    brief = _brief(seg, keyframe_tag)
    unit = {"id": f"G{k}", "kind": "generate", "strategy": strategy, "label": label, "label_zh": LABEL_ZH[label],
            "shots": [r["index"] for r in seg], "start": round(t0, 3), "end": round(t1, 3), "duration": dur, "ranges": ranges,
            "mode": "multi_shot" if len(seg) > 1 else ("split" if parts > 1 else "single"), "calls": parts,
            "generate_s": round(dur / parts, 3), "model": (model or {}).get("id"), "model_name": model_name((model or {}).get("name")),
            "refs": refs, "brief": brief, "draft": _draft(strategy, refs, brief, swaps_txt, style),
            "inputs": _inputs(strategy, refs, seg, spec)}
    unframed = [x["shot"] for x in brief if strategy == "keyframes" and not x.get("composition")]
    missing = [x["shot"] for x in brief if not x["action"]]
    if missing:
        unit["prompt_missing"] = missing
    acting = [{"shot": r["index"], "line": performance.summary(a), "key": a["key"],
               "how": performance.ROUTE_ZH[performance.route_kind(a, r["base"]["label"])]} for r in seg for a in [performance.of(r)] if a]
    if acting:
        unit["acting"] = acting
    if unframed:
        unit["unframed"] = unframed
        unit["note"] = T("参考图名额不够：镜头 {s} 没配原片画面，构图写在提示词里", "not enough image slots: shots {s} have no source frame, their framing is written in the prompt",
                         s=shot_ids(unframed))
    if len(ranges) > 1:
        unit["note"] = (unit.get("note", "") + semi() if unit.get("note") else "") + T("这几镜在成片里被插入画面隔开：连着生成，剪辑时把插入画面放回去",
                         "these shots are separated by inserts in the cut: generate them together and put the inserts back in the edit")
    return unit


# ---------------------------------------------------------------- the whole generation part
def part_starts(b: dict) -> set[int]:
    """Shots where a part of the video begins: a narrative step starts, or a caption card / title changes there."""
    from .narrative import beats

    out = {x["shots"][0] for x in beats(b) if x.get("shots")}
    cues = [c for c in (b.get("packaging") or {}).get("text_cues") or [] if c.get("kind") in ("subtitle", "title", "huazi", "label")]
    for r in b["shots"]:
        if any(abs(c["t0"] - r["start"]) <= 0.5 for c in cues):
            out.add(r["index"])
    return out


def plan_generation(b: dict, model: dict | None, intent: dict, new_scene: set[int], style: str, skip: set[int]) -> dict:
    """Generation units and the facts they were planned on. `skip`: shots made another way (motion drive, a clip
    reused from another unit)."""
    spec = spec_of(model)
    labels = ALL_GEN_LABELS if intent.get("generate") == "all" else GEN_LABELS
    own = []
    swaps_txt = []
    for s in intent.get("swaps") or []:
        tag = None
        if s.get("image"):
            tag = f"@图片{len(own) + 1}"
            own.append({"tag": tag, "user": True, "path": s["image"],
                        "what": (s["to"] or T("用户给的参考图", "the user's reference image")) + (T("（替换原片的{f}）", " (replaces the source's {f})", f=s["from"]) if s["from"] else "")})
        if s["from"] or s["to"]:
            swaps_txt.append(T("原片的{f}换成{t}", "the source's {f} becomes {t}", f=s["from"] or T("主体", "subject"), t=s["to"] or tag)
                             + (T("（参考 {k}）", " (see {k})", k=tag) if tag else ""))
    strategy = choose_strategy(spec, len(own))
    if strategy == "remix":
        max_s, max_shots = min(spec["max"], spec["ref_total"]), spec["shots"]
    elif strategy == "keyframes":
        # a swapped-in subject with no image is held only by its description: every extra call is another chance for it
        # to come out different, so keep calls whole and let some shots go without a source frame
        text_only = any(not s.get("image") for s in intent.get("swaps") or [])
        max_s, max_shots = spec["max"], (spec["shots"] if text_only else min(x for x in (spec["shots"], spec["images"] - len(own)) if x))
    elif strategy == "text" and spec["multi_shot"]:
        max_s, max_shots = spec["max"], spec["shots"]
    else:
        max_s, max_shots = spec["max"], 1
    units: list[dict] = []
    new_part = part_starts(b)
    for run in runs(b["shots"], labels, skip, joinable_inserts=strategy in ("remix", "keyframes", "text")):
        for seg in pack(run, max_s, max_shots, new_scene, new_part):
            units.append(build_unit(seg, len(units) + 1, strategy, spec, own, swaps_txt, style, model))
    return {"strategy": strategy, "spec": spec, "labels": list(labels), "units": units, "own_refs": own,
            "rules": {"max_s": max_s, "max_shots": max_shots, "generate": intent.get("generate", "ai")}}


# ---------------------------------------------------------------- checks
TAG_RES = (r"@图片(\d+)", r"<Picture (\d+)>", r"(?<![@<])图片(\d+)", r"\[Image (\d+)\]", r"\bImage (\d+)\b")
VIDEO_TAG_RES = (r"@视频(\d+)", r"<Video (\d+)>", r"\bVideo (\d+)\b")


def lint_prompt(text: str, n_images: int, n_videos: int, notes: dict | None) -> list[str]:
    """What breaks the model's own format: image / video numbers past what is sent, length, required and forbidden
    parts (from the model's `lint` notes in the capability map)."""
    rules = (notes or {}).get("lint") or {}
    errs = []
    imgs = [int(x) for p in TAG_RES for x in re.findall(p, text)]
    vids = [int(x) for p in VIDEO_TAG_RES for x in re.findall(p, text)]
    if imgs and max(imgs) > n_images:
        errs.append(T("提到了第 {k} 张图，但只传 {n} 张", "refers to image {k} but only {n} are sent", k=max(imgs), n=n_images))
    if vids and max(vids) > n_videos:
        errs.append(T("提到了第 {k} 段视频，但只传 {n} 段", "refers to video {k} but only {n} are sent", k=max(vids), n=n_videos))
    if rules.get("max_cjk") and len(re.findall(r"[\u3400-\u9fff]", text)) > int(rules["max_cjk"]):
        errs.append(T("中文 {n} 字，超过这个模型的 {m} 字", "{n} Chinese characters, over this model's {m}",
                      n=len(re.findall(r"[\u3400-\u9fff]", text)), m=rules["max_cjk"]))
    if rules.get("max_chars") and len(text) > int(rules["max_chars"]):
        errs.append(T("{n} 字符，超过这个模型的 {m}", "{n} characters, over this model's {m}", n=len(text), m=rules["max_chars"]))
    for need in rules.get("require") or []:
        if need not in text:
            errs.append(T("缺少「{x}」", "missing “{x}”", x=need))
    for f in rules.get("forbid") or []:
        if isinstance(f, dict) and f.get("re") and re.search(f["re"], text):
            errs.append(str(f.get("why") or f["re"]))
    if rules.get("language") == "en":
        body = re.sub(r"<d>.*?</d>|\"[^\"]*\"", "", text, flags=re.S)  # dialogue and on-screen text keep their own language
        cjk = len(re.findall(r"[㐀-鿿]", body))
        if cjk > 0.05 * max(1, len(body)):
            errs.append(T("这个模型的提示词要用英文（台词和画面文字除外）", "this model's prompts should be in English (dialogue and on-screen text aside)"))
    return errs


SHOT_RES = (r"\[Shot (\d+)\]", r"镜头\s*(\d+)", r"\bShot (\d+)\b")


def shots_written(text: str) -> int:
    """How many shots a prompt numbers (0 when it does not number them)."""
    return max([int(x) for p in SHOT_RES for x in re.findall(p, text)] or [0])


def unit_images(u: dict) -> list[dict]:
    """The images one unit sends, in prompt order."""
    return [r for r in u.get("refs") or [] if r["tag"].startswith("@图片")]


def checks(plan: dict, intent: dict, prompts: dict[str, str], notes: dict | None, gen_seconds: float) -> list[dict]:
    """Problems to fix before paying for generation. level "error" blocks `remake-plan`; "warn" is shown."""
    spec, units = plan.get("spec") or {}, plan.get("units") or []
    out: list[dict] = []

    def add(level: str, msg: str, unit: str | None = None) -> None:
        out.append({"level": level, "msg": msg, **({"unit": unit} if unit else {})})

    if intent.get("error"):
        add("error", T("remake/intent.yaml 读不了：{e}", "remake/intent.yaml cannot be read: {e}", e=intent["error"]))
    if not intent.get("model"):
        add("warn", T("还没选模型：问用户用哪个，写进 remake/intent.yaml 的 model", "no model chosen: ask the user and set model in remake/intent.yaml"))
    if intent.get("generate") == "all" and not intent.get("swaps"):
        add("warn", T("整条重做，但意图里没写要换什么（swaps）", "the whole video is remade but the intent lists nothing to swap (swaps)"))
    for s in intent.get("swaps") or []:
        if s.get("image") and not Path(s["image"]).is_file():
            add("error", T("参考图不存在：{p}", "reference image not found: {p}", p=s["image"]))
    if spec.get("multi_ref") and not spec.get("images_stated"):
        add("warn", T("能力地图没写这个模型最多几张参考图，按 {n} 张排的；查到实际数后补进模型资料", "the capability map has no image limit for this model; planned for {n}, add the real one", n=UNKNOWN_IMAGES))
    for u in units:
        n_img, n_vid = len(unit_images(u)), len({r["tag"] for r in u["refs"] if r["tag"].startswith("@视频")})
        if spec.get("images") is not None and n_img > max(spec["images"], 0) and (n_img or spec.get("multi_ref")):
            add("error", T("{u} 要传 {n} 张图，超过这个模型的 {m} 张", "{u} sends {n} images, over this model's {m}", u=u["id"], n=n_img, m=spec["images"]), u["id"])
        for part in sorted({r.get("part", 1) for r in u["refs"] if r["tag"].startswith("@视频")}):
            secs = sum(z - a for r in u["refs"] if r["tag"].startswith("@视频") and r.get("part", 1) == part for a, z in r["ranges"])
            if secs > spec.get("ref_total", 1e9) + 1e-3:
                add("error", T("{u} 参考视频共 {s:.1f} 秒，超过这个模型的 {m:.0f} 秒", "{u} has {s:.1f}s of reference video, over this model's {m:.0f}s",
                               u=u["id"], s=secs, m=spec["ref_total"]), u["id"])
        if u["generate_s"] < SHORT_UNIT_S:
            add("warn", T("{u} 只有 {d:.1f} 秒：单独生成不稳，按模型最短时长生成后剪短，或和相邻镜头合到一起",
                          "{u} is only {d:.1f}s: unstable on its own; generate the model's minimum and trim, or join it with a neighbour", u=u["id"], d=u["generate_s"]), u["id"])
        final = prompts.get(u["id"])
        if not final:
            add("warn", T("{u} 还是通用草稿：按 {m} 的写法写好最终提示词，放进 remake/prompts.json", "{u} still has the generic draft: write the final prompt in {m}'s format into remake/prompts.json",
                          u=u["id"], m=u.get("model_name") or u.get("model") or "?"), u["id"])
        else:
            for e in lint_prompt(final, n_img, n_vid, notes):
                add("error", f"{u['id']}: {e}", u["id"])
            n = shots_written(final)
            if n and len(u["shots"]) > 1 and n != len(u["shots"]):  # written for another split of the shots
                add("error", T("{u} 的最终提示词写了 {n} 个镜头，单元里有 {m} 个：按现在的单元重写", "{u}'s final prompt numbers {n} shots but the unit has {m}: rewrite it for the current unit",
                               u=u["id"], n=n, m=len(u["shots"])), u["id"])
    stale = sorted(set(prompts) - {u["id"] for u in units})
    if stale:
        add("warn", T("remake/prompts.json 里的 {s} 已经不在方案里，用不到了", "{s} in remake/prompts.json are not in the plan", s="、".join(stale)))
    calls = sum(u["calls"] for u in units)
    if units and gen_seconds > 0 and calls / (gen_seconds / 60) > CALLS_PER_MIN:
        add("warn", T("{c} 次生成做 {s:.0f} 秒，切得太碎", "{c} calls for {s:.0f}s: cut too finely", c=calls, s=gen_seconds))
    return out


def check_lines(cs: list[dict]) -> list[str]:
    icon = {"error": "❌", "warn": "⚠️"}
    return [f"- {icon.get(c['level'], '-')} {c['msg']}" for c in cs]


# ---------------------------------------------------------------- report
INPUT_ZH = {"text": ("文字提示词", "text prompt"), "first_frame": ("首帧图", "first frame"), "last_frame": ("尾帧图", "last frame"),
            "ref_image": ("参考图", "reference images"), "ref_video": ("参考视频", "reference video")}
NEED_ZH = {"yes": ("要", "yes"), "opt": ("建议", "worth it"), "no": ("不用", "no")}


def _fed(u: dict) -> str:
    return " + ".join(dict.fromkeys(T(*INPUT_ZH[x["kind"]]) for x in u.get("inputs") or [] if x["need"] != "no" and x["kind"] != "text"))


def report_md(plan: dict, prompts: dict[str, str]) -> list[str]:
    """The generation subsection of the remake part: how it was grouped, then one block per unit."""
    units = plan.get("units") or []
    if not units:
        return []
    rules, spec = plan.get("rules") or {}, plan.get("spec") or {}
    st = plan.get("strategy")
    how = {"remix": T("这段原片擦掉字幕后当参考视频，模型照它的分镜、运镜和节奏出完这段的镜头",
                      "the source stretch, subtitles erased, is the reference video; the model follows its shots, camera and pacing"),
           "keyframes": T("这个模型不吃参考视频，每个镜头给一张擦掉字幕的原片画面定构图，换进去的东西各给参考图",
                          "the model takes no reference video: one source frame per shot (subtitles erased) fixes composition, swapped-in things get their own images"),
           "frames": T("一次只出一个镜头，从原片首帧（和尾帧）起步", "one shot per call, from the source's first (and last) frame"),
           "text": T("只有文字提示词", "prompt only")}[st]
    L = [T("- 分组：连着的镜头尽量放进同一次生成，单次 ≤{s:.0f} 秒", "- Grouping: consecutive shots share a call where they fit, ≤{s:.0f}s per call", s=rules.get("max_s") or 0)
         + (T("、≤{n} 个镜头", ", ≤{n} shots", n=rules["max_shots"]) if rules.get("max_shots") else "")
         + T("；段太长时优先在换场景处切开", "; a long stretch is cut at a scene change first"),
         T("- 输入：{h}", "- Inputs: {h}", h=how)]
    if plan.get("audio_note"):
        L.append(T("- 声音：{a}", "- Audio: {a}", a=plan["audio_note"]))
    if plan.get("overlay_note"):
        L.append(T("- 包装层：{a}", "- Packaging: {a}", a=plan["overlay_note"]))
    L += ["", T("| 单元 | 镜头 | 时间 | 时长 | 要喂的 | 提示词 |", "| Unit | Shots | Time | Length | Feed | Prompt |"), "|---|---|---|---|---|---|"]
    for u in units:
        when = join(f"{a:.1f}–{z:.1f}s" for a, z in u["ranges"])
        L.append(f"| {u['id']} | {shot_ids(u['shots'])} | {when} | {u['duration']:.1f}s"
                 f"{T('（{c} 次）', ' ({c} calls)', c=u['calls']) if u['calls'] > 1 else ''} | {_fed(u) or '—'} | "
                 f"{T('最终版', 'final') if u['id'] in prompts else T('草稿', 'draft')} |")
    for u in units:
        L += ["", "<details><summary>" + T("{id} · 镜头 {sh} · {d:.1f}s · {m}", "{id} · shots {sh} · {d:.1f}s · {m}",
                                           id=u["id"], sh=shot_ids(u["shots"]), d=u["duration"], m=strategy_name(u["strategy"])) + "</summary>", "",
              T("| 输入 | 要不要 | 从哪来 | 为什么 |", "| Input | Needed | From | Why |"), "|---|---|---|---|"]
        L += [f"| {T(*INPUT_ZH[x['kind']])} | {T(*NEED_ZH[x['need']])} | {x['source']} | {x['why']} |" for x in u["inputs"]]
        for k in ("note",):
            if u.get(k):
                L += ["", f"- {u[k]}"]
        for a in u.get("acting") or []:
            L.append(T("- 表演 #{s}{k}：{l}（{h}，见「表演与情绪」）", "- Acting #{s}{k}: {l} ({h}, see “Acting and emotion”)",
                       s=a["shot"], k=T("（看点）", " (key)") if a["key"] else "", l=a["line"], h=a["how"]))
        final = prompts.get(u["id"])
        L += ["", T("最终提示词（按 {m} 的写法）：", "Final prompt ({m} format):", m=u.get("model_name") or u.get("model")) if final
              else T("提示词草稿（通用写法，生成前按 {m} 的写法改写进 remake/prompts.json）：", "Draft prompt (generic; rewrite it in {m}'s format into remake/prompts.json before generating):",
                     m=u.get("model_name") or u.get("model")),
              "", "```text", final or u["draft"], "```", "", "</details>"]
    return L
