"""From per-shot breakdown to a production plan: how the shots would actually be made again.

Edit shots (cut detection) are the facts; making them is organised differently:
  AI shots      -> generation units: consecutive same-scene shots one model call can produce together,
                   sized by the chosen model's limits (duration, multi-shot, references) and routing rules S01-S06
  filmed shots  -> shooting setups: shots grouped by scene (not only adjacent ones) and, inside a scene,
                   by camera setup (shot size + support), so each setup is lit and shot once
  code / screen -> one code composition per contiguous run
  still motion  -> rebuilt locally from one image
"""
from __future__ import annotations

from .i18n import LangDict, T, join, lang, model_name, semi, shot_ids

import json
import re
from pathlib import Path

import cv2

from .util import read_image
from .classify import LABEL_ZH
from .aspects.camera import SUPPORT_ZH
from .aspects.vocab import canon, show
from .plan import CODE_STYLES, Planner, code_scene, shot_prompts, with_acting
from . import performance

from .generation import ALL_GEN_LABELS, GEN_LABELS  # noqa: E402  what a video model makes, per remake intent

SHOOT_LABELS = ("live_action", "stop_motion")
GEN_ZH = LangDict({"ai_video": "AI 视频", "cg_3d": "3D 渲染", "anim_2d": "2D 动画", "live_action": "实拍", "stop_motion": "定格动画",
                  "film_footage": "影视片段", "avatar": "数字人"},
                 en={"ai_video": "AI video", "cg_3d": "3D render", "anim_2d": "2D animation", "live_action": "live action",
                     "stop_motion": "stop motion", "film_footage": "film footage", "avatar": "digital avatar"})
CODE_LABELS = ("code_render", "screen_capture")
LOCAL_LABELS = ("still_motion", "static_hold")
SIZE_ORDER = {"远景": 0, "全景": 1, "中景": 2, "近景": 3, "特写": 4,  # zh / en shot-size words (aspects.framing.SIZES);
              "wide shot": 0, "full shot": 1, "medium shot": 2, "medium close-up": 3, "close-up": 4, "extreme close-up": 5}  # full names: no prefix clashes
PRODUCT_KINDS = ("product_photo", "logo")



# how a scene is entered, for the motion timeline headings
_TRANSITION_IN = {"dissolve": ("叠化", "dissolve"), "fade": ("淡入", "fade"), "wipe": ("划像", "wipe"), "slide": ("推移", "slide"),
                  "whip": ("甩镜", "whip pan"), "zoom": ("缩放", "zoom"), "spin": ("旋转", "spin"), "blur": ("模糊", "blur"),
                  "glitch": ("故障", "glitch"), "shake": ("抖动", "shake")}

def _norm(s: str) -> str:
    return s.replace("-", "").replace("_", "").replace(" ", "").lower()


# ---------------------------------------------------------------- scene similarity
def _hist(path: Path):
    im = read_image(path)
    if im is None:
        return None
    h = cv2.calcHist([cv2.cvtColor(im, cv2.COLOR_BGR2HSV)], [0, 1, 2], None, [18, 4, 4], [0, 180, 0, 256, 0, 256])
    cv2.normalize(h, h)
    return h


def scene_signatures(shots: list[dict], out: Path) -> dict[int, list]:
    sig = {}
    for r in shots:
        hs = [_hist(out / r["assets"][k]) for k in ("first_frame", "last_frame") if r.get("assets", {}).get(k)]
        sig[r["index"]] = [h for h in hs if h is not None]
    return sig


def scene_distance(a: list, b: list) -> float:
    """Smallest colour-distribution distance between any key frame of two shots (0 = same, 1 = unrelated)."""
    d = [cv2.compareHist(x, y, cv2.HISTCMP_BHATTACHARYYA) for x in a for y in b]
    return float(min(d)) if d else 1.0


HUES = ((10, "红", "red"), (22, "橙", "orange"), (35, "黄", "yellow"), (78, "绿", "green"),  # OpenCV hue (0-180) bands
        (100, "青", "cyan"), (130, "蓝", "blue"), (170, "紫", "purple"), (181, "红", "red"))


def lit_colours(paths: list[Path], top: int = 3, min_share: float = 0.15) -> list[str]:
    """Main colours of the lit part of a shot's key frames (what the glowing elements are coloured), most first."""
    votes: dict[tuple, float] = {}
    n = 0
    for p in paths:
        im = read_image(p)
        if im is None:
            continue
        hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).reshape(-1, 3)
        lit = hsv[hsv[:, 2] > 60]
        if not len(lit):
            continue
        n += 1
        grey = lit[:, 1] < 60
        votes[("白", "white")] = votes.get(("白", "white"), 0.0) + float(grey.mean())
        hue = lit[~grey][:, 0]
        lo = 0
        for hi, zh, en in HUES:
            votes[(zh, en)] = votes.get((zh, en), 0.0) + float(((hue >= lo) & (hue < hi)).sum()) / len(lit)
            lo = hi
    ranked = sorted(votes.items(), key=lambda kv: -kv[1])
    return [T(*w) for w, v in ranked[:top] if n and v / n >= min_share]


def code_motion_md(scenes: list[dict]) -> list[str]:
    """Per-shot motion timeline of the code shots (measured): what appears where, when, how and in what colour."""
    from .motion import event_line, layer_line, static_line

    L = ["", T("逐镜动效时间轴（工具测量：位置是占画面宽高的百分比，颜色是元素稳定后的取色；配合关键帧条看）",
               "Per-shot motion timeline (measured: positions in % of frame width / height, colours sampled once the element settles; "
               "read together with the key-frame strip)"), ""]
    for sc in scenes:
        head = f"#{sc['shot']} {sc['start']:.1f}–{sc['end']:.1f}s"
        if sc.get("transition_in") == "flash":
            head += T("（闪亮切入：切进来时整幅画面先变亮，{s:.1f}s 内回落）", " (flash cut: the picture opens bright and settles in {s:.1f}s)",
                      s=sc.get("flash_s") or 0)
        elif sc.get("transition_in") in _TRANSITION_IN:
            head += T("（{t}切入）", " ({t} in)", t=T(*_TRANSITION_IN[sc["transition_in"]]))
        n_ev = len(sc.get("events") or [])
        L.append('<details class="ref"><summary>' + T("动效 {h} · {n} 个", "Motion {h} · {n} events", h=head, n=n_ev) + "</summary>")
        L.append("")
        if sc.get("strip"):
            L += [f"![{head}]({sc['strip']})", ""]
        if sc.get("background"):
            L.append(T("- 背景 {bg}；其他主色 {c}", "- Ground {bg}; other main colours {c}", bg=sc["background"],
                       c=" ".join(c for c in sc.get("palette") or [] if c != sc["background"]) or "—")
                     + (T("；前景（画上去的那层）{d}", "; drawn layer {d}", d=" ".join(sc["drawn"])) if sc.get("drawn") else ""))
        if sc.get("elements_sheet"):
            L += [T("元素截图（编号对应下面的动效；L 是持续运动层的镜头中段和结尾，S 是整镜不动的元素），原分辨率单张在 `shots/` 里：",
                    "Element crops (numbers match the motion list below; L = the continuously moving layer mid-shot and at the end, "
                    "S = elements that never move), full-size files in `shots/`:"),
                  "", f"![{head}]({sc['elements_sheet']})", ""]
        for k, e in enumerate(sc.get("static") or [], 1):
            L.append(f"- S{k}. " + T("整镜不动：", "never moves: ") + static_line(e))
        if sc.get("layer"):
            L.append("- " + layer_line(sc["layer"]))
        for q in sc.get("sequences") or []:
            L.append("- " + T("依次出现：{n} 个同样大小的元素，间隔 {i:.2f}s，每个用时约 {e:.2f}s（下面第 {k} 条）",
                             "In sequence: {n} same-size elements, {i:.2f}s apart, about {e:.2f}s each (items {k} below)",
                             n=q["n"], i=q["interval"], e=q["each"], k=T("、", ", ").join(str(x + 1) for x in q["events"])))
        for i, ev in enumerate(sc.get("events") or [], 1):
            L.append(f"{i}. " + event_line(ev))
        if not (sc.get("events") or sc.get("layer") or sc.get("static")):
            L.append(T("- 没有测到元素运动（静止画面或只有细微变化）", "- No element motion measured (still picture or only slight changes)"))
        L += ["", "</details>", ""]
    return L


def model_facts(model_id: str | None) -> str:
    """What the plan was built on, in one line: per-call length, multi-shot, reference inputs, native sound, and where
    the facts come from and when they were checked (a model changes; the reader should see how fresh this is)."""
    m = Planner().models.get(model_id or "")
    if not m:
        return T("能力地图里没有这个模型，按通用规则排", "not in the capability map; planned on generic rules")
    lim, prim = m.get("limits") or {}, set(m.get("primitives") or [])
    d, refs = lim.get("duration_s") or {}, lim.get("refs") or {}
    rv = (lim.get("ref_video_s") or {}).get("max")
    bits = [T("单次 ≤{s:g} 秒", "≤{s:g} s per call", s=d["max"]) if d.get("max") else "",
            T("一次可出多个镜头", "several shots per call") if "video.multi_shot" in prim else T("一次一个镜头", "one shot per call"),
            (T("能吃参考视频", "takes reference video") + (T("（{n} 段", " ({n} clips", n=refs["video"]) if refs.get("video") else "")
             + (T("，总长 ≤{s:g} 秒", ", ≤{s:g} s in all", s=rv) if rv else "") + (T("）", ")") if refs.get("video") else ""))
            if "video.reference_video" in prim else T("不吃参考视频", "no reference video"),
            T("参考图 ≤{n} 张", "≤{n} reference images", n=refs["image"]) if refs.get("image") else "",
            T("首尾帧", "first / last frame") if "video.i2v_first_last" in prim else "",
            T("能直接出声", "native sound") if (m.get("audio") or {}).get("native") else ""]
    v = m.get("verified") or {}
    src = T("本地补充的资料", "your own entry") if m.get("local") else T("能力地图", "capability map")
    return T("，", ", ").join(x for x in bits if x) + T("（{src}，核实于 {d}）", " ({src}, checked {d})", src=src, d=v.get("date") or "?")


# ---------------------------------------------------------------- model choice
def pick_model(planner: Planner, engine: str) -> tuple[dict | None, dict | None]:
    """-> (the user's engine as a capability entry, the model the generation units are planned for).
    Plan for the named model when the capability map has it as a video generator (shot by shot if it cannot do
    multi-shot); a name the map does not know falls back to the first live multi-shot model in R11."""
    live = {k: m for k, m in planner.models.items() if m.get("status") not in ("shutdown", "deprecated")}
    eng = next((m for m in live.values() if _norm(m["id"]) == _norm(engine)), None)
    if eng and eng.get("category") == "video" and {"video.t2v", "video.i2v_first_frame"} & set(eng.get("primitives", [])):
        return eng, eng
    best = None
    for mid in (planner.rules.get("R11-recurring-character") or {}).get("prefer", []):
        m = live.get(mid)
        if m and m.get("status") == "ga" and "video.multi_shot" in m.get("primitives", []):
            best = m
            break
    return eng, best or eng


PROMPTING_FIELDS = (("structure", "结构"), ("language", "语言"), ("length", "长度"), ("multi_shot", "多镜头和时间"),
                    ("references", "参考素材怎么指代"), ("dialogue", "台词和声音"), ("negatives", "不想要的内容"), ("camera", "运镜"),
                    ("frame_mode", "首帧 / 首尾帧模式下写什么"), ("frames", "帧图和参考图"), ("rewriter", "自动改写"))


def prompting_md(notes: dict, full: bool = False) -> list[str]:
    """One model's prompt-writing notes as bullet lines; full adds what is unverified and the sources."""
    L = [f"- **{zh}**：{notes[k]}" for k, zh in PROMPTING_FIELDS if notes.get(k)]
    for k, zh in (("pitfalls", "注意"),) + ((("unverified", "待核实"), ("sources", "来源")) if full else ()):
        if notes.get(k):
            L += [f"- **{zh}**："] + [f"  - {x}" for x in notes[k]]
    return L


def _limits(m: dict | None) -> dict:
    lim = (m or {}).get("limits") or {}
    d = lim.get("duration_s") or {}
    refs = lim.get("refs") or {}
    rv = (lim.get("ref_video_s") or {}).get("max")
    return {"max": float(d.get("max") or 10), "min": float(d.get("min") or 0), "refs": refs,
            "ref_total": float(rv) if rv else 15.0 * max(1, int(refs.get("video") or 1)),
            "multi_shot": "video.multi_shot" in (m or {}).get("primitives", []),
            "ref_video": "video.reference_video" in (m or {}).get("primitives", []),
            "multi_ref": "video.multi_reference" in (m or {}).get("primitives", []),
            "first_frame": "video.i2v_first_frame" in (m or {}).get("primitives", []),
            "exclusive": bool(lim.get("exclusive_inputs")),
            "first_last": "video.i2v_first_last" in (m or {}).get("primitives", []),
            "native_audio": bool(((m or {}).get("audio") or {}).get("native"))}


# ---------------------------------------------------------------- generation units
def reused_footage(gen: list[dict]) -> dict[int, int]:
    """Generated shots an image reader marked as the same clip as another generated shot (a trailer cut from the
    finished clip up front, a replay): {shot shown again: shot it is cut from}. Pixels alone cannot tell this from
    the same setup at another moment (eval daihuo: the trailer and the finished clip differ as much as two talking-head
    shots from one camera), so only the reader's mark counts."""
    ids = {r["index"] for r in gen}
    out: dict[int, int] = {}
    for r in gen:
        src = (r.get("review") or {}).get("same_clip_as") or (r.get("vlm") or {}).get("same_clip_as")
        if isinstance(src, int) and src in ids and src != r["index"] and src not in out:
            out[r["index"]] = src
    return out


def _style_line(shots: list[dict], aspect_ratio: str) -> str:
    """One style sentence for every unit (most common lighting reading across the generated shots, by duration),
    so separately generated units still look like one video."""
    orient = {"9:16": T("竖屏 9:16", "Vertical 9:16"), "16:9": T("横屏 16:9", "Horizontal 16:9"), "1:1": T("方形 1:1", "Square 1:1"),
              "3:4": T("竖屏 3:4", "Vertical 3:4"), "4:3": T("横屏 4:3", "Horizontal 4:3")}.get(aspect_ratio, aspect_ratio)
    bits = [orient]
    picks = []
    for key in ("setup_name", "quality", "color_temp", "depth"):
        votes: dict[str, float] = {}
        for r in shots:
            v = (((r.get("aspects") or {}).get("lighting") or {}).get("result") or {}).get(key)
            if v:
                votes[v] = votes.get(v, 0.0) + r["duration"]
        if votes:
            picks.append(max(votes.items(), key=lambda kv: kv[1])[0])
    if picks:
        bits.append(T("，", ", ").join(picks))
    return semi().join(bits)


# ---------------------------------------------------------------- shooting setups
def _setups(shots: list[dict], sig: dict, thr: float, b: dict) -> list[dict]:
    from .entities import cast as _cast

    filmed = [r for r in shots if r["base"]["label"] in SHOOT_LABELS]
    scenes: list[list[dict]] = []
    named: list[dict] = []
    # an image reader who named the scenes knows where each shot was filmed better than colour histograms do
    # (a talking head and a desk shot of a phone in the same office have the same colours)
    cs = [sc for sc in _cast(b).get("scenes") or [] if sc.get("shots")]
    where = {i: k for k, sc in enumerate(cs) for i in sc["shots"]}
    if filmed and all(r["index"] in where for r in filmed):
        for k, sc in enumerate(cs):
            rs = [r for r in filmed if where[r["index"]] == k]
            if rs:
                scenes.append(rs)
                named.append(sc)
    else:
        for r in filmed:
            d = [(min(scene_distance(sig[r["index"]], sig[m["index"]]) for m in sc), i) for i, sc in enumerate(scenes)]
            best = min(d) if d else (1.0, -1)
            if best[0] <= thr:
                scenes[best[1]].append(r)
            else:
                scenes.append([r])
    out = []
    for si, sc in enumerate(scenes, 1):
        groups: dict[tuple, list[dict]] = {}
        for r in sc:
            a = r.get("aspects") or {}
            # group on normalised values: free-text answers ("近景（手持物品特写）") would split one setup into many
            raw = str(((a.get("framing") or {}).get("result") or {}).get("shot_size") or "")
            size = next((k for k in SIZE_ORDER if (canon(raw) or "").startswith(k)), raw or "—")
            cam = (a.get("camera") or {}).get("result") or {}
            support = SUPPORT_ZH.get(cam.get("support"), cam.get("support_zh") or "—")
            groups.setdefault((size, support), []).append(r)
        light = (((sc[0].get("aspects") or {}).get("lighting") or {}).get("result") or {})
        desc = (sc[0].get("vlm") or sc[0].get("review") or {}).get("description", "")
        if named:
            nm = named[si - 1]
            desc = T("，", ", ").join(str(x) for x in (nm.get("where"), nm.get("look")) if x) or desc
        setups = []
        for (size, support), rs in sorted(groups.items(), key=lambda kv: SIZE_ORDER.get(kv[0][0], 9)):
            setups.append({"shot_size": show(size), "support": support, "shots": [r["index"] for r in rs],
                           "screen_s": round(sum(r["duration"] for r in rs), 2),
                           "take_s": round(sum(r["duration"] for r in rs) + 2.0 * len(rs), 1),
                           "moves": sorted({show(((r.get("aspects") or {}).get("camera") or {}).get("result", {}).get("move")) or T("固定", "static") for r in rs})})
        post = [dict(e, shot=r["index"]) for r in sc for e in (r.get("ai_edits") or [])]
        out.append({"id": f"S{si}", "kind": "shoot", "shots": [r["index"] for r in sc], "post": post,
                    "stop_motion": [r["index"] for r in sc if r["base"]["label"] == "stop_motion"],
                    "screen_s": round(sum(r["duration"] for r in sc), 2), "description": desc,
                    "lighting": _light_words(sc[0], light),
                    "setups": setups})
    return out


def _light_words(r: dict, light: dict) -> str:
    """Lighting in a few plain words: what the image reader called the setup, else the measured setup and colour."""
    seen = (((r.get("review") or r.get("vlm") or {}).get("aspects") or {}).get("lighting") or {}).get("lighting_setup")
    if seen:
        return str(seen)
    short = lambda x: re.split(r"[（(]", str(x))[0].strip() if x else ""  # noqa: E731  "正面（光从镜头方向来…）" -> "正面"
    return T("，", ", ").join(x for x in (light.get("setup_name"), short(light.get("key_direction")) and T("主光{d}", "key light {d}", d=short(light.get("key_direction"))),
                                         light.get("color_temp")) if x)


# ---------------------------------------------------------------- whole plan
def production_plan(b: dict, out: Path, engine: str = "seedance2.0") -> dict:
    """The remake part: generation units (for the model and intent in remake/intent.yaml), motion drive, shooting
    scenes, code builds, local rebuilds, film clips. `engine` is used when the intent names no model."""
    from . import generation as gen_mod

    shots = b["shots"]
    intent = gen_mod.load_intent(out)
    if not intent.get("model") and (b.get("intent") or {}).get("model"):
        intent["model"] = b["intent"]["model"]
    b["intent"] = intent
    gen_labels = tuple(ALL_GEN_LABELS if intent.get("generate") == "all" else GEN_LABELS)
    planner = Planner()
    seg = planner.routing.get("segmentation", {}).get("defaults", {})
    thr = float(seg.get("same_scene_distance", 0.5))
    sig = scene_signatures(shots, out)
    from .entities import cast as _cast

    # scenes an image reader named beat colour histograms (a close-up and a wide shot of one table differ in colour)
    named = {i: k for k, sc in enumerate(_cast(b).get("scenes") or []) for i in sc.get("shots") or []}

    def same_scene(a: dict, c: dict) -> bool:
        if a["index"] in named and c["index"] in named:
            return named[a["index"]] == named[c["index"]]
        return scene_distance(sig[a["index"]], sig[c["index"]]) <= thr

    same_prev = {r["index"]: same_scene(p, r) for p, r in zip(shots, shots[1:])}
    new_scene = {r["index"] for r in shots if not same_prev.get(r["index"], False)}
    eng, model = pick_model(planner, intent.get("model") or engine)
    gen = [r for r in shots if r["base"]["label"] in gen_labels]
    style = _style_line(gen, b["source"].get("aspect_ratio", "")) if gen else ""
    reused = reused_footage(gen)
    from . import dance

    motion = dance.motion_indices(b)  # the moves are the point: driven from the source motion, not generated from frames
    g = gen_mod.plan_generation(b, model, intent, new_scene, style, set(reused) | motion)
    units = g["units"]
    for again, src in sorted(reused.items()):
        u = next((u for u in units if src in u["shots"]), None)
        if u:
            u.setdefault("reused", []).append({"shot": again, "from": src})
    plan: dict = {"model": (model or {}).get("id"), "model_name": model_name((model or {}).get("name")), "strategy": g["strategy"],
                  "spec": g["spec"], "rules": g["rules"], "units": units, "intent": intent}
    lim = g["spec"]
    gen_shots = sum(len(u["shots"]) for u in units)
    if units:
        calls = sum(u["calls"] for u in units)
        plan["calls"] = calls
        plan["gen_shots"] = gen_shots
        if model and (not eng or eng["id"] != model["id"]):
            plan["engine_note"] = T("能力地图里没有 {e}，这里按 {m} 规划（单次 ≤{mx:.0f}s），共 {c} 次；先查这个模型的资料补进能力地图",
                                    "The capability map has no {e}; this plan is for {m} (≤{mx:.0f}s per call), {c} call{cs} in total. Look the model up and add it first",
                                    e=intent.get("model") or engine, m=model_name(model["name"]), mx=lim["max"], c=calls, cs=_s(calls))
        if model and planner.prompting.get(model["id"]):
            plan["prompting"] = planner.prompting[model["id"]]
        voice = ((b.get("audio") or {}).get("voice") or {}).get("present")
        vsrc = ((b.get("sound_sources") or {}).get("voice") or {}).get("source")
        if lim["native_audio"]:
            plan["audio_note"] = T("模型可以同时生成动作音效和环境声", "the model can generate action sound effects and ambience along with the picture") + \
                (semi() + (T("口播建议单独 TTS 再混进去，方便改文案和卡时间", "voice-over is better done as separate TTS and mixed in, so copy and timing stay editable")
                           if vsrc == "tts" else
                           T("口播是真人录的：单独录好再混进去，不让视频模型生成，方便改文案和卡时间",
                             "the voice was recorded by a person: record it separately and mix it in rather than having the video model speak, so copy and timing stay editable"))
                 if voice else "")
        from .packaging import overlays_at

        on_gen = list(dict.fromkeys(k for u in units for a, z in u["ranges"] for k in overlays_at(b.get("packaging"), a, z)))
        if on_gen:  # generated picture stays clean; the packaging is laid on afterwards, so a new wording can move it
            plan["overlay_note"] = T("生成镜头上的{k}属于后期包装，不写进提示词；原片参考上带着的已擦掉，生成后按「剪辑包装层」的时间轴叠回",
                                     "the {k} on the generated shots is post-production packaging: keep it out of the prompts (erased from source references) "
                                     "and lay it back on from the packaging timeline after generation", k=join(on_gen))
    gen_s = sum(u["duration"] for u in units)
    prompts = gen_mod.load_prompts(out)
    plan["prompts"] = {k: v for k, v in prompts.items() if any(u["id"] == k for u in units)}
    plan["checks"] = gen_mod.checks(plan, intent, prompts, plan.get("prompting"), gen_s)
    plan["drive"] = dance.units(b)
    plan["shoot"] = _setups([r for r in shots if r["base"]["label"] not in gen_labels], sig, thr, b)
    code, cur = [], []
    for r in shots + [None]:
        if r is not None and r["base"]["label"] in CODE_LABELS:
            cur.append(r)
            continue
        if cur:
            code.append({"id": T("段{n}", "Part {n}", n=len(code) + 1), "kind": "code", "shots": [x["index"] for x in cur],
                         "start": cur[0]["start"], "end": cur[-1]["end"], "duration": round(cur[-1]["end"] - cur[0]["start"], 3),
                         "screen_capture": [x["index"] for x in cur if x["base"]["label"] == "screen_capture"],
                         "text_tracks": sum(len((x.get("text") or {}).get("tracks", [])) for x in cur),
                         "scenes": [{"shot": x["index"], "start": x["start"], "end": x["end"], **code_scene(x),
                                     "colours": lit_colours([out / x["assets"][k] for k in ("first_frame", "last_frame")
                                                             if (x.get("assets") or {}).get(k)])} for x in cur]})
            cur = []
    plan["code"] = code
    ps = out / "frames" / "scenes.json"
    # only shots still in the code build: a review that relabels a shot drops its scenes from the plan
    code_shots = {sh for c in code for sh in c["shots"]}
    if code_shots and ps.exists():
        try:
            plan["layer_scenes"] = [{k: sc.get(k) for k in ("id", "shot", "start", "end", "points", "frames", "motion", "enter")} | {"measure": {
                k: (sc.get("measure") or {}).get(k) for k in ("ground", "glow", "colours", "pieces", "box")}}
                for sc in json.loads(ps.read_text(encoding="utf-8")).get("scenes", []) if sc.get("shot") in code_shots]
        except (OSError, ValueError, TypeError):
            pass
    plan["local"] = [{"shot": r["index"], "label_zh": r["base"]["label_zh"], "duration": r["duration"]}
                     for r in shots if r["base"]["label"] in LOCAL_LABELS]
    plan["avatar"] = [r["index"] for r in shots if r["base"]["label"] == "avatar"]
    plan["footage"] = footage_runs(shots)
    plan["_labels"] = {r["index"]: r["base"]["label"] for r in shots}
    plan["summary"] = summary_line(plan, b)
    del plan["_labels"]
    return plan


def footage_runs(shots: list[dict]) -> list[dict]:
    """Film / TV clips in a row: the stretches to find in the source."""
    runs, cur = [], []
    for r in shots + [None]:
        if r is not None and r["base"]["label"] == "film_footage":
            cur.append(r)
            continue
        if cur:
            runs.append({"shots": [x["index"] for x in cur], "start": cur[0]["start"], "end": cur[-1]["end"],
                         "duration": round(cur[-1]["end"] - cur[0]["start"], 3)})
            cur = []
    return runs


def _s(n: int) -> str:
    """English plural suffix (unused in Chinese)."""
    return "" if n == 1 else "s"


def summary_line(plan: dict, b: dict) -> str:
    bits = []
    if plan["units"]:
        kinds: dict[str, int] = {}
        for u in plan["units"]:
            for i in u["shots"]:
                lab = plan["_labels"][i]
                kinds[lab] = kinds.get(lab, 0) + 1
        what = " + ".join(T("{g} {v} 镜", "{v} {g} shot{s}", g=GEN_ZH.get(k, k), v=v, s=_s(v)) for k, v in kinds.items())
        nu = len(plan["units"])
        again = sum(len(u.get("reused") or []) for u in plan["units"])
        bits.append(T("{what} → {u} 个生成单元、{c} 次 {m} 调用", "{what} → {u} generation unit{us}, {c} {m} call{cs}",
                      what=what, u=nu, us=_s(nu), c=plan["calls"], cs=_s(plan["calls"]), m=plan["model_name"])
                    + (T("（另有 {n} 镜是同一段成片重复使用，直接剪）", " (plus {n} shot{s} reusing the same clip, just cut)", n=again, s=_s(again)) if again else ""))
    if plan.get("drive"):
        from .dance import summary_bit

        bits.append(summary_bit(plan["drive"]))
    if plan["shoot"]:
        n_set = sum(len(s["setups"]) for s in plan["shoot"])
        n_shot = sum(len(s["shots"]) for s in plan["shoot"])
        n_stop = sum(len(s.get("stop_motion", [])) for s in plan["shoot"])
        what = T("实拍", "live action") if not n_stop else (T("定格动画", "stop motion") if n_stop == n_shot else T("实拍 / 定格", "live action / stop motion"))
        n_sc = len(plan["shoot"])
        bits.append(T("{what} {n} 镜 → {sc} 个场景、{st} 个机位", "{what} {n} shot{s1} → {sc} scene{s2}, {st} camera setup{s3}",
                      what=what, n=n_shot, s1=_s(n_shot), sc=n_sc, s2=_s(n_sc), st=n_set, s3=_s(n_set)))
        n_post = len({e["shot"] for s in plan["shoot"] for e in s.get("post", [])})
        if n_post:
            bits.append(T("其中 {n} 镜拍完还要 AI 加工（{k}）", "{n} of them need{v} AI processing after the shoot ({k})",
                          n=n_post, v="s" if n_post == 1 else "", k=join(dict.fromkeys(e["kind_zh"] for s in plan["shoot"] for e in s["post"]))))
    if plan["code"]:
        n = sum(len(c["shots"]) for c in plan["code"])
        bits.append(T("代码渲染/录屏 {n} 镜 → 1 个代码工程", "code render / screen capture {n} shot{s} → 1 code project", n=n, s=_s(n))
                    + (T("（{n} 段）", " ({n} parts)", n=len(plan["code"])) if len(plan["code"]) > 1 else ""))
    if plan["local"]:
        n = len(plan["local"])
        bits.append(T("静图推拉/静帧 {n} 镜 → 本地重建", "still-image move / static frame {n} shot{s} → rebuilt locally", n=n, s=_s(n)))
    if plan.get("footage"):
        n = sum(len(f["shots"]) for f in plan["footage"])
        bits.append(T("影视片段 {n} 镜 → 找原片剪辑", "film / TV footage {n} shot{s} → cut from the source", n=n, s=_s(n)))
    if plan["avatar"]:
        n = len(plan["avatar"])
        bits.append(T("数字人 {n} 镜 → TTS + 数字人驱动", "digital avatar {n} shot{s} → TTS + avatar driver", n=n, s=_s(n)))
    return semi().join(bits)


def report_parts(plan: dict) -> dict[str, list[str]]:
    """The remake plan cut at its subsections, so a report can place each part under the step it belongs to:
    pre (AI notes and the input primer), units, shoot, code, local, footage. The summary line is left out."""
    heads = {T("### 生成单元", "### Generation units"): "units", T("### 动作驱动", "### Motion drive"): "drive", T("### 拍摄场次", "### Shooting scenes"): "shoot",
             T("### 代码合成", "### Code composition"): "code", T("### 本地重建", "### Local rebuild"): "local",
             T("### 影视原片", "### Film / TV source"): "footage"}
    parts: dict[str, list[str]] = {}
    key = "pre"
    for line in report_md(plan)[4:]:  # "", "## 复刻方案", "", "**summary**"
        if line in heads:
            key = heads[line]
            continue
        parts.setdefault(key, []).append(line)
    return {k: v for k, v in parts.items() if any(x.strip() for x in v)}


def scene_motion_words(sc: dict) -> str:
    """A scene's measured motion in words: how it enters, zoom, turn, pan and how much single points wander."""
    m = sc.get("motion") or {}
    w = [T("从上一场景变形过来", "morphs in from the last scene")] if sc.get("enter") == "morph" else []
    z, r, (px, py) = m.get("zoom", 0), m.get("rotate", 0), m.get("pan") or (0, 0)
    if abs(z) >= 0.01:
        w.append(T(f"{'推近' if z > 0 else '拉远'} {abs(z) * 100:.0f}%/s", f"{'zoom in' if z > 0 else 'zoom out'} {abs(z) * 100:.0f}%/s"))
    if abs(r) >= 0.5:
        w.append(T(f"{'顺' if r > 0 else '逆'}时针转 {abs(r):.1f}°/s", f"turns {'clockwise' if r > 0 else 'anticlockwise'} {abs(r):.1f}°/s"))
    if max(abs(px), abs(py)) >= 0.005:
        w.append(T(f"平移 ({px * 100:+.1f}%, {py * 100:+.1f}%)/s", f"pans ({px * 100:+.1f}%, {py * 100:+.1f}%)/s"))
    if m.get("drift", 0) >= 0.004:
        w.append(T("粒子各自漂动", "points wander"))
    return T("、", ", ").join(w) or ("—" if not m else T("基本不动", "near still"))


def layer_scenes_md(scenes: list[dict]) -> list[str]:
    """Rendered shots split into scenes (the drawing rearranges without a cut), with the measured look and where to
    find the drawn layer of each."""
    if not scenes:
        return []
    L = ["", T("**画面场景**（镜头内画上去的东西整体换了位置或形状就算新场景。`frames/` 里每个场景有首 / 中 / 尾原尺寸帧，"
               "`scene_XX_layer.png` 是中间帧画上去的那一层（背景和文字已去掉，透明度按突出程度），"
               "`frames/points/scene_XX.json` 是从这一层取的采样点，每行 `x y r g b a`，x、y 是 0–1 坐标；"
               "按这些摆粒子、描线或重画图形，不用照文字描述去猜形状。`frames/scenes.json` 的 `track` 是这一层的重心和散开程度随时间的变化）",
               "**Picture scenes** (a new scene whenever what is drawn moves or changes shape as a whole inside a shot. `frames/` holds first / "
               "middle / last full-size frames per scene, `scene_XX_layer.png` the drawn layer of the middle frame (background and text "
               "removed, alpha by how strongly it stands out), `frames/points/scene_XX.json` samples of that layer, one `x y r g b a` per row "
               "with x, y in 0–1. Place particles, trace lines or redraw shapes from these instead of guessing from a description. `track` in "
               "`frames/scenes.json` follows the layer's centre and spread over time)"), "",
         T("| 场景 | 镜头 | 时间 | 底色 | 背景光 | 前景颜色 | 块数 | 范围 (x0 y0 x1 y1) | 运动 |",
           "| Scene | Shot | Time | Ground | Background glow | Drawn colours | Pieces | Area (x0 y0 x1 y1) | Motion |"),
         "|---|---|---|---|---|---|---|---|---|"]
    for sc in scenes:
        m = sc.get("measure") or {}
        gl = m.get("glow") or {}
        gw = (T("{c}，中心 ({x:.2f}, {y:.2f})，半径 {r:.2f}", "{c}, centre ({x:.2f}, {y:.2f}), radius {r:.2f}", c=gl["colour"],
                x=gl["centre"][0], y=gl["centre"][1], r=gl["radius"]) if gl else "—")
        cols = " ".join(c["hex"] for c in m.get("colours") or []) or "—"
        box = " ".join(f"{v:.2f}" for v in m.get("box") or []) or "—"
        L.append(f"| {sc['id']} | #{sc['shot']} | {sc['start']:.1f}–{sc['end']:.1f}s | {m.get('ground') or '—'} | {gw} | {cols} | "
                 f"{m.get('pieces') or '—'} | {box} | {scene_motion_words(sc)} |")
    L += ["", T("做完用 `rea-video compare 原片 成片 --scenes frames/scenes.json -o 对比目录` 打分（两边各按自己的底色取前景，换了底色也能比），"
                "按 `compare_worst.jpg` 先改分数最低的场景。",
                "When built, score it with `rea-video compare original remake --scenes frames/scenes.json -o dir` (each side's drawn layer "
                "is taken against its own ground, so a new ground colour still compares) and fix the lowest-scoring scenes first, from "
                "`compare_worst.jpg`.")]
    return L


def report_md(plan: dict) -> list[str]:
    if not plan:
        return []
    L = ["", T("## 复刻方案", "## Remake plan"), "", f"**{plan['summary']}**", ""]
    if plan.get("engine_note"):
        L += [f"- {plan['engine_note']}"]
    if plan["units"]:
        from .generation import report_md as gen_report

        L += ["", T("### 生成单元", "### Generation units"), ""] + gen_report(plan, plan.get("prompts") or {})
        if plan.get("prompting") and lang() == "zh":
            L += ["", "<details><summary>" + f"{plan['model_name']} 的提示词写法" + "</summary>", ""] + prompting_md(plan["prompting"]) + ["", "</details>"]
    if plan.get("drive"):
        from .dance import report_md as _drive_md

        L += _drive_md(plan["drive"])
    if plan["shoot"]:
        L += ["", T("### 拍摄场次", "### Shooting scenes"), "",
              T("同一场景的镜头集中拍完再换场景；场景内先拍大景别再拍特写，不用重新布光。每条前后多留约 1s 余量。",
                "Shoot every shot of one scene before moving to the next; within a scene, shoot the wider sizes first and the close-ups last "
                "so the lighting is set only once. Leave about 1s of handle at both ends of every take."), ""]
        for s in plan["shoot"]:
            L.append(T("**{id}**：镜头 {sh}（成片 {scr}s）", "**{id}**: shots {sh} ({scr}s on screen)",
                       id=s["id"], sh=shot_ids(s["shots"]), scr=s["screen_s"])
                     + (semi() + s["description"] if s.get("description") else ""))
            if s.get("lighting"):
                L.append(T("- 布光：{l}", "- Lighting: {l}", l=s["lighting"]))
            for st in s["setups"]:
                L.append(T("- 机位 {size} · {sup} · {mv}：镜头 {sh}，成片 {scr}s，建议拍 {take}s",
                           "- Setup {size} · {sup} · {mv}: shots {sh}, {scr}s on screen, shoot about {take}s",
                           size=st["shot_size"], sup=st["support"], mv="/".join(st["moves"]), sh=shot_ids(st["shots"]),
                           scr=st["screen_s"], take=st["take_s"]))
            if s.get("stop_motion"):
                L.append(T("- 定格动画（{sh}）：相机固定，每秒约 12 张逐帧拍；用定格 App 的洋葱皮对位，灯光全程不动（避免闪烁）",
                           "- Stop motion ({sh}): camera locked off, about 12 frames per second shot one at a time; line up frames with a "
                           "stop-motion app's onion skin and keep the lighting fixed throughout (avoids flicker)",
                           sh=shot_ids(s["stop_motion"])))
            for e in s.get("post", []):
                L.append(T("- 拍完后 #{s} 要 AI 加工：{k}", "- After the shoot, #{s} needs AI processing: {k}", s=e["shot"], k=e["kind_zh"])
                         + (T("（{e}）", " ({e})", e=e["evidence"]) if e.get("evidence") else "")
                         + (f" → {e['how']}" if e.get("how") else ""))
            L.append("")
    if plan["code"]:
        L += ["", T("### 代码合成", "### Code composition"), "",
              T("用 HTML 视频框架（如 HyperFrames、Remotion）重做一个工程：切点、转场和每镜关键帧照「节奏与关键帧」，版式、配色和元素照下面的场景；"
                "文字、界面 100% 可控，改文案只改数据，可以让 AI 编程助手直接写。",
                "Rebuild it as one project in an HTML video framework (such as HyperFrames or Remotion): cuts, transitions and each shot's key "
                "frames from \"Rhythm and key frames\", layout, colours and elements from the scenes below. Text and UI are 100% controllable, "
                "changing copy is a data change, and an AI coding assistant can write the project."), "",
              T("`rea-video code-remake <拆解目录>` 只出一版快速草稿：按每个场景的采样点 / 抠图、运动和背景光渲染出 `code/remake.mp4` 并打分。"
                "粒子、点云、数据可视化这类暗底图形能接近原片；插画角色的动作和形变转场出不来。",
                "`rea-video code-remake <breakdown folder>` only makes a quick draft: it renders `code/remake.mp4` from each scene's sampled "
                "points / cut-out, motion and background glow and scores it. Particles, point clouds and data visualisations on a dark ground "
                "come close; an illustrated character's acting and morph transitions do not."), ""]
        for c in plan["code"]:
            L.append(T("- {id}：镜头 {sh}（{a:.1f}–{z:.1f}s）", "- {id}: shots {sh} ({a:.1f}–{z:.1f}s)",
                       id=c["id"], sh=shot_ids(c["shots"]), a=c["start"], z=c["end"])
                     + (semi() + T("其中 {sh} 用真实界面录屏", "{sh} use real screen recordings", sh=shot_ids(c["screen_capture"]))
                        if c["screen_capture"] else ""))
        scenes = [sc for c in plan["code"] for sc in c.get("scenes", [])]
        if any(sc.get("strip") or sc.get("elements_sheet") for sc in scenes):
            L += ["", T("复刻资产（都在报告目录里，复刻时和下面的数据一起交给写代码的人或 LLM）：",
                        "Remake assets (all in the report folder; hand them over together with the data below to whoever writes the code, or to an LLM):"),
                  T("- `shots/shot_XXX_first.jpg` / `_last.jpg`：每镜首尾帧原分辨率，对版式、字号、留白",
                    "- `shots/shot_XXX_first.jpg` / `_last.jpg`: first / last frame of each shot at full size, for layout, type size and margins"),
                  T("- `shots/shot_XXX_strip.jpg`：约每 0.5 秒一张的关键帧条，看动画过程",
                    "- `shots/shot_XXX_strip.jpg`: key frames about every 0.5 s, to follow the animation"),
                  T("- `shots/shot_XXX_elements.jpg` 和 `_el_NN.jpg` / `_st_NN.jpg` / `_ly_NN.jpg`：每个元素停稳后的原分辨率截图，编号对应动效时间轴；"
                    "图形照着重画，图标、Logo、插画这类画不出来的可以直接抠图用",
                    "- `shots/shot_XXX_elements.jpg` and `_el_NN.jpg` / `_st_NN.jpg` / `_ly_NN.jpg`: full-size crop of every element once settled, "
                    "numbered as in the motion timeline; redraw shapes from them, cut out icons, logos and illustrations that cannot be redrawn"),
                  T("- `packaging/overlays.ass`、`packaging/timeline.json`：文字的时间、位置、颜色",
                    "- `packaging/overlays.ass`, `packaging/timeline.json`: timing, position and colour of the text")]
        if scenes:
            styles = CODE_STYLES()
            used = list(dict.fromkeys(sc.get("style", "shapes") for sc in scenes))
            L += ["", T("画面做法（按工具测得的画面类型）：", "How to build the pictures (by the measured picture type):")]
            L += [f"- {styles[k][0]}{T('：', ': ')}{styles[k][1]}" for k in used]
            if "particles" in used:
                L += ["", T("粒子类镜头：每一镜粒子拼成什么形状、怎么动是复刻好坏的关键，章节牌、标注、数字等 HUD 文字用 HTML 层叠在上面，"
                            "按下表逐镜做，不要所有镜头共用一个背景。",
                            "Particle shots: what shape the particles form in each shot and how it moves decides whether the remake works; "
                            "chapter cards, labels and counters go in an HTML layer on top. Build shot by shot from the table below, not one shared background.")]
            L += ["", T("| 镜头 | 时间 | 做法 | 画面 | 运镜 | 主色 | 画面文字 |", "| Shot | Time | Build | Picture | Camera | Colours | On-screen text |"),
                  "|---|---|---|---|---|---|---|"]
            for sc in scenes:
                pic = sc["picture"].replace("|", "/").replace("\n", " ") or T("（待看图补：画面元素拼成什么、怎么动）",
                                                                              "(to fill from the images: what the elements form and how they move)")
                cols = (T("底 {bg}", "ground {bg}", bg=sc["background"]) + " · " + " ".join(c for c in sc["palette"] if c != sc["background"])
                        + (T(" · 前景 ", " · drawn ") + " ".join(sc["drawn"]) if sc.get("drawn") else "")
                        if sc.get("background") else T('、', ', ').join(sc['colours']) or '—')
                L.append(f"| #{sc['shot']} | {sc['start']:.1f}–{sc['end']:.1f}s | {styles[sc.get('style', 'shapes')][0]} | {pic} | {sc['move']} | "
                         f"{cols} | {' / '.join(w.replace('|', '/') for w in sc['on_screen_text']) or '—'} |")
            L += layer_scenes_md(plan.get("layer_scenes") or [])
            L += code_motion_md(scenes)
    if plan["local"]:
        L += ["", T("### 本地重建", "### Local rebuild"), "", "- " + semi().join(f"#{x['shot']} {x['label_zh']} {x['duration']:.1f}s" for x in plan["local"])
              + T("：一张图 + 测得的缩放/平移参数，ffmpeg 直接出", ": one image + the measured zoom / pan parameters, rendered straight from ffmpeg")]
    if plan.get("footage"):
        L += ["", T("### 影视原片", "### Film / TV source"), "",
              T("- 这些镜头剪自已有的影视作品：找到原片对应片段再剪，版权属于片方，商用要授权；不用原片时按同样景别、机位和打光自己拍，或用 AI 做近似画面",
                "- These shots are cut from existing films or series: find the same clips in the source and cut them; rights belong to the studio and commercial use needs a licence. "
                "Without the source, shoot them yourself with the same shot size, camera setup and lighting, or approximate them with AI"), ""]
        for f in plan["footage"]:
            L.append(f"- {f['start']:.1f}–{f['end']:.1f}s " + T("{n} 镜", "{n} shot{s}", n=len(f["shots"]), s=_s(len(f["shots"]))))
    return L
