"""What kind of video this is, and the hands-on steps to make one like it.

The kind decides which steps there are and in what order (a talking head is shot, voiced, cut and subtitled; an
AI short needs references, first frames and generation units; a beat montage starts from the music). The content
of every step comes from this breakdown (measured framing, light, cutting, sound, packaging, the generation plan)
or from what this tool produces (files and commands). A step with no data behind it is left out.

The kind comes from what is already measured: the share of each picture class, the live-action format (talking
head / desk / vlog), the sound type (song, voice-over, location sound), beat-synced cutting and the cast.
"""
from __future__ import annotations

import re

from . import dance, entities, narrative, performance
from .i18n import LangDict, T, model_name

NAME_ZH = LangDict({
    "talking_head": "人物口播", "desk": "桌拍 / 开箱 / 带货", "vlog": "vlog 随拍", "live_drama": "实拍剧情",
    "ai_drama": "AI 剧情短片", "ai_product": "AI 商品广告", "ai_mv": "AI 音乐 MV", "avatar": "数字人口播",
    "ai_clip": "AI 短片段（萌宠 / 奇观 / 单场景）", "animation": "3D / 动画",
    "film": "影视解说 / 混剪", "explainer": "动效科普 / 数据动画", "screen": "录屏教程 / 软件演示",
    "slideshow": "图片推拉成片（图文 / 故事 / 推文）", "beat": "卡点混剪", "dance": "舞蹈 / 动作表演",
}, en={
    "talking_head": "talking head", "desk": "tabletop / unboxing / product", "vlog": "vlog", "live_drama": "live-action skit",
    "ai_drama": "AI story short", "ai_product": "AI product ad", "ai_mv": "AI music video", "avatar": "digital-avatar talking head",
    "ai_clip": "short AI clip (pets / spectacle / single scene)", "animation": "3D / animation",
    "film": "film commentary / film-clip montage", "explainer": "motion-graphics explainer", "screen": "screen tutorial / software demo",
    "slideshow": "stills with pan and zoom (photo story)", "beat": "beat-synced montage", "dance": "dance / action performance",
})

_LIVE = ("live_action",)
_AI = ("ai_video",)
_ANIM = ("cg_3d", "anim_2d", "stop_motion")
_STILL = ("still_motion", "static_hold")
_LIVE_KINDS = ("talking_head", "desk", "vlog", "live_drama")
_GENERATED_KINDS = ("ai_drama", "ai_product", "ai_mv", "avatar", "ai_clip", "animation")


def _shares(b: dict) -> dict[str, float]:
    out: dict[str, float] = {}
    for m in (b.get("summary") or {}).get("production_mix") or []:
        out[m["label"]] = out.get(m["label"], 0.0) + float(m.get("ratio") or 0)
    return out


def _format(b: dict) -> str:
    return (((b.get("aspects") or {}).get("format") or {}).get("result") or {}).get("format") or ""


def _sound_type(b: dict) -> str:
    return ((b.get("sound_sources") or {}).get("format_context") or {}).get("video_type") or ""


def _has_product(b: dict, cast: dict) -> bool:
    if any(c.get("kind") == "product" for c in cast.get("characters") or []):
        return True
    return any(a.get("kind") in ("product_photo", "logo") for r in b.get("shots", []) for a in (r.get("material") or {}).get("references", []))


def _people(cast: dict) -> int:
    return sum(1 for c in cast.get("characters") or [] if c.get("kind") in ("person", "animal", "cartoon", "avatar"))


def _group(shares: dict[str, float]) -> list[tuple[str, float]]:
    g = {"live": sum(shares.get(k, 0) for k in _LIVE), "ai": sum(shares.get(k, 0) for k in _AI),
         "avatar": shares.get("avatar", 0), "anim": sum(shares.get(k, 0) for k in _ANIM),
         "code": shares.get("code_render", 0), "screen": shares.get("screen_capture", 0),
         "still": sum(shares.get(k, 0) for k in _STILL), "film": shares.get("film_footage", 0)}
    return sorted(((k, v) for k, v in g.items() if v > 0), key=lambda x: -x[1])


def _type_of_group(b: dict, grp: str, cast: dict) -> str:
    s, audio = b.get("summary") or {}, b.get("audio") or {}
    if grp == "live":
        fmt = _format(b)
        if fmt == "talking_head":
            return "talking_head"
        if fmt in ("desk", "product"):
            return "desk"
        talkers = (b.get("speakers") or {}).get("count") or 0
        return "live_drama" if _people(cast) >= 2 or (talkers >= 2 and s.get("shots", 0) >= 6) else "vlog"
    if grp in ("ai", "anim"):
        if _sound_type(b) == "music_mv":
            return "ai_mv"
        if _has_product(b, cast):
            return "ai_product"
        if grp == "anim":
            return "animation"
        long_story = float((b.get("source") or {}).get("duration") or 0) >= 40 or _people(cast) >= 2
        talks = bool((audio.get("voice") or {}).get("present"))
        return "ai_drama" if long_story and (talks or s.get("shots", 0) >= 8) else "ai_clip"
    return {"avatar": "avatar", "code": "explainer", "screen": "screen", "still": "slideshow", "film": "film"}[grp]


def kinds(b: dict) -> list[tuple[str, float]]:
    """[(type, share)], the main type first; a second type is listed when it covers at least a quarter of the time."""
    shares = _shares(b)
    groups = _group(shares)
    if not groups:
        return []
    cast = entities.cast(b)
    s, audio = b.get("summary") or {}, b.get("audio") or {}
    if dance.is_motion_video(b):  # the moves carry the video, however it was cut or made
        return [("dance", dance.share(b))]
    voice = float((audio.get("voice") or {}).get("ratio") or 0) if (audio.get("voice") or {}).get("present") else 0.0
    avg, music = float(s.get("avg_shot_s") or 9), bool((audio.get("music") or {}).get("present"))
    if _sound_type(b) != "music_mv" and ((audio.get("beat_synced_edit") and avg <= 1.6 and voice < 0.3)
                                         or (music and avg <= 1.2 and voice < 0.1)):
        return [("beat", 1.0)]
    out = [(_type_of_group(b, groups[0][0], cast), groups[0][1])]
    for g, v in groups[1:]:
        t = _type_of_group(b, g, cast)
        if v >= 0.25 and t != out[0][0]:
            out.append((t, v))
            break
    return out


def _after_colon(x: str) -> str:
    for sep in ("：", ": "):
        if sep in x:
            return x.split(sep, 1)[1].strip()
    return x.strip()


_UNKNOWN = ("未测出", "not measured")


def _aspect(b: dict, key: str) -> str:
    lines = ((b.get("aspects") or {}).get(key) or {}).get("lines") or []
    if not lines:
        return ""
    sep = T("；", "; ")
    parts = [p for p in _after_colon(lines[0]).split(sep) if p.strip() and not any(u in p for u in _UNKNOWN)]
    return sep.join(parts)


def _src(b: dict, k: str) -> str:
    v = (b.get("sound_sources") or {}).get(k) or {}
    if not v.get("source_zh"):
        return ""
    sure = v.get("source") != "unknown" and (v.get("probs") or {}).get(v.get("leaning"), 0) >= 0.6
    z = v["source_zh"]
    return z + ("" if sure or T("待确认", "to confirm") in z else T("（倾向，待确认）", " (leaning, to confirm)"))


def _cut(b: dict) -> str:
    s, src = b.get("summary") or {}, b.get("source") or {}
    n, dur = int(s.get("shots") or 0), float(src.get("duration") or 0)
    if n <= 1:
        return T("原片一镜到底（{d:.0f} 秒）", "the original is a single {d:.0f} s take", d=dur)
    return T("原片 {n} 个镜头、平均 {a:.1f} 秒一刀", "the original has {n} shots at {a:.1f}s each", n=n, a=float(s.get("avg_shot_s") or 0))


# Every step below is built from this video's breakdown or from what this tool produces (files, commands).
# None of them carries a rule of thumb from elsewhere: when the data for a step is missing, the step is left out.

def _content(b: dict) -> str | None:
    beats = narrative.beats(b)
    lines = entities.script(b)
    if beats:
        return T("**写内容**：照原片的 {k} 段顺序写自己的版本（叙事线在「内容与结构」）",
                 "**Write the content**: write yours in the same {k} steps as the original (narrative line under “Content and structure”)",
                 k=len(beats))
    n = (b.get("summary") or {}).get("shots") or 0
    if n <= 1 and not lines:
        if any(c.get("kind") == "subtitle" for c in (b.get("packaging") or {}).get("text_cues") or []):
            return T("**写内容**：原片一镜到底，说了什么看「剪辑包装层」里的字幕原文，写自己的版本",
                     "**Write the content**: the original is one take; what it says is in the subtitle text under “Packaging layer”; write your own")
        return T("**写内容**：原片一镜到底，画面内容见分镜表，写自己的版本", "**Write the content**: the original is one take, described in the shot list; write your own")
    if lines:
        return T("**写内容**：把原片的 {k} 句台词换成自己的话（脚本表在「声音」），画面照分镜表",
                 "**Write the content**: replace the original's {k} lines with your own (script table under “Sound”); pictures follow the shot list", k=len(lines))
    return T("**写内容**：照分镜表的 {n} 个镜头逐镜写自己的画面", "**Write the content**: one picture of your own for each of the {n} shots in the shot list", n=n)


def _all_generated(b: dict) -> bool:
    """The user remakes the whole video with a model (people, animals or products swapped): nothing is filmed or reused."""
    return (b.get("intent") or {}).get("generate") == "all"


def model_chosen(b: dict) -> bool:
    """The user named the model the remake is for (remake/intent.yaml); until then nothing model-specific is shown."""
    return bool((b.get("intent") or {}).get("model"))


def _material(b: dict, live: bool, refs: bool) -> str | None:
    s = b.get("summary") or {}
    rm = {} if _all_generated(b) else (s.get("real_material") or {})
    kinds: list[str] = []
    for k in rm.get("kinds") or {}:
        k = k.split("（")[0].split(" (")[0].strip()
        if k not in kinds and not (live and k in ("实拍视频素材", "live footage")):
            kinds.append(k)
    cast = entities.cast(b)
    who = [c.get("name") for c in cast.get("characters") or [] if c.get("name")]
    swaps = (b.get("intent") or {}).get("swaps") or []
    out = []
    if swaps:  # the remake intent says what goes in; the source's own cast is not what needs a picture
        have = [x["to"] or x["from"] for x in swaps if x.get("image")]
        bare = [x["to"] or x["from"] for x in swaps if not x.get("image")]
        if have:
            out.append(T("参考图已有：{h}", "reference images in hand: {h}", h=T("；", "; ").join(have)))
        if bare:
            out.append(T("只有文字描述（各给一张参考图会更稳，跨镜头不变样）：{h}", "described in words only (an image each keeps them the same across shots): {h}",
                         h=T("、", ", ").join(re.split(r"[，,;；]", x)[0].strip() for x in bare)))
        who = []
    if kinds:
        out.append(T("画面里的真实素材（{k}）要拿到原文件，清单见「要准备的素材」", "the real material in the picture ({k}) needs the original files, listed under “What to prepare”",
                     k=T("、", ", ").join(kinds)))
    if who and refs:
        out.append(T("每个角色准备一张参考图，所有镜头都用同一张：{w}", "one reference image per character, the same one in every shot: {w}", w=T("、", ", ").join(who[:6])))
    if s.get("references") and refs:
        out.append(T("商品、Logo 等参考图见「复刻要准备的参考素材」", "product and logo references under “Reference material to prepare”"))
    return (T("**备素材**：", "**Collect material**: ") + T("；", "; ").join(out)) if out else None


def _first(x: str) -> str:
    """The plain-words head of a measured line: before the first dash, semicolon or full stop."""
    return re.split(r"——|；|; |。|\. ", _after_colon(x), maxsplit=1)[0].strip()


def _shoot(b: dict) -> list[str]:
    """One step: how many scenes, how it is framed and lit, in words a person can set up. The numbers stay under “Shoot”."""
    if _all_generated(b):
        return []
    plan, sp = b.get("production_plan") or {}, b.get("shooting_plan") or {}
    shoot = plan.get("shoot") or []
    if not shoot and not sp:
        return []
    bits = []
    if len(shoot) > 1:
        bits.append(T("{n} 个场景，同一场景的镜头一起拍", "{n} scenes, shoot each scene in one go", n=len(shoot)))
    look = next((_after_colon(x) for x in sp.get("steps") or [] if x.startswith((T("取景", "Framing")))), "") or _first(_aspect(b, "framing"))
    if look:
        ar = (b.get("source") or {}).get("aspect_ratio") or ""
        bits.append((T("手机竖拍，", "phone held vertical, ") if ar == "9:16" else "") + look)
    light = next((_first(x) for x in sp.get("steps") or [] if x.startswith(T("布光", "Light"))), "") or _first(_aspect(b, "lighting"))
    gear = (sp.get("gear") or [""])[0]
    if light or gear:
        bits.append(T("光：", "light: ") + T("，", ", ").join(x for x in (light, gear) if x))
    grade = _first(_aspect(b, "grade"))
    if grade:
        bits.append(T("调色{g}", "grade: {g}", g=grade))
    if not bits:
        return []
    return [T("**拍摄**：", "**Shoot**: ") + T("；", "; ").join(bits) + T("（机位清单在「拍摄」）", " (setups under “Shoot”)")]


def _units(b: dict) -> list[dict]:
    return [u for u in (b.get("production_plan") or {}).get("units") or [] if u.get("kind", "generate") == "generate"]


def _generate(b: dict) -> list[str]:
    """Generate, then rewrite the prompts for the model actually used: every model reads prompts its own way."""
    plan, units = b.get("production_plan") or {}, _units(b)
    if not units:
        return []
    if not model_chosen(b):  # the split, the calls and the prompts depend on a model the user has not named yet
        n = sum(len(u.get("shots") or []) for u in units)
        secs = sum(float(u.get("duration") or 0) for u in units)
        return [T("**AI 镜头**：{n} 个镜头（共 {s:.0f} 秒）要用视频模型生成。先选模型：告诉 agent 你用哪个，"
                  "它按这个模型的能力排好分段、输入和提示词（`rea-video plan <拆解目录> --model <模型>`）",
                  "**AI shots**: {n} shots ({s:.0f} s) to make with a video model. Pick the model first: tell the agent which one and it "
                  "plans the stretches, inputs and prompts for it (`rea-video plan <folder> --model <model>`)", n=n, s=secs)]
    L = []
    if any(u.get("prompt_missing") for u in units):
        L.append(T("**补提示词**：这次没开看图，生成单元里的镜头描述是空的；先让 agent 跑 `rea-video review` 看图补写",
                   "**Fill in the prompts**: this run had no image reading, so the shot descriptions in the units are empty; have the agent run `rea-video review` first"))
    secs = sum(float(u.get("duration") or 0) for u in units)
    chained = any(any(i.get("kind") == "first_frame" and i.get("need") == "yes" and "shot_" not in (i.get("source") or "") for i in u.get("inputs") or [])
                  for u in units)
    native = ((b.get("sound_sources") or {}).get("voice") or {}).get("source") == "ai_video_native"
    calls = plan.get("calls") or len(units)
    if plan.get("strategy") == "remix":
        L.append(T("**AI 生成**：{c} 次生成（共 {s:.0f} 秒）。每次把原片对应的一段当参考视频喂给模型，模型照它的分镜和节奏出完这段的镜头，"
                   "提示词只写每个镜头换成什么；参考视频已擦掉字幕切好，在 `remake/refs/`",
                   "**Generate**: {c} call{p} ({s:.0f} s). Each call gets its stretch of the source as the reference video and the model follows "
                   "its shots and pacing; the prompt says only what each shot becomes. The reference clips, subtitles erased, are in `remake/refs/`", c=calls, p="" if calls == 1 else "s", s=secs))
    elif plan.get("strategy") == "keyframes":
        L.append(T("**AI 生成**：{c} 次生成（共 {s:.0f} 秒），每次连着出几个镜头。每个镜头给一张原片画面定构图（已擦掉字幕，在 `remake/refs/`），"
                   "换进去的人、动物、商品各给一张参考图，提示词按镜头顺序写动作",
                   "**Generate**: {c} call{p} ({s:.0f} s), several shots each. Each shot gets one source frame for composition (subtitles "
                   "erased, in `remake/refs/`), the swapped-in people, animals and products get reference images, and the prompt lists the shots in order",
                   c=calls, p="" if calls == 1 else "s", s=secs))
    else:
        L.append(T("**AI 生成**：{u} 段（共 {s:.0f} 秒），每段的首帧图、参考图和提示词在「AI 生成」", "**Generate**: {u} unit{p} ({s:.0f} s); first frame, references and prompt for each under “AI generation”",
                   u=len(units), p="" if len(units) == 1 else "s", s=secs)
                 + (T("；有几段接在上一段的尾帧上，按顺序生成", "; some start on the previous unit's last frame, so go in order") if chained else ""))
    L[-1] = (L[-1]
             + (T("；原片的对白是随画面一起生成的，台词写进提示词", "; the original's dialogue was generated with the picture, so the lines go in the prompt") if native else ""))
    m = model_name(plan.get("model_name"))
    done = plan.get("prompts") or {}
    if done and all(u["id"] in done for u in units):
        errs = [c for c in plan.get("checks") or [] if c["level"] == "error"]
        L.append(T("**提示词**：已按 {m} 的写法写好（`remake/prompts.json`）", "**Prompts**: written in {m}'s format (`remake/prompts.json`)", m=m)
                 + (T("，格式检查通过", ", format checks passed") if not errs else T("，格式检查有 {n} 处要改（见「方案检查」）", ", {n} format problems to fix (see “Plan checks”)", n=len(errs))))
        return L
    L.append(T("**按模型改提示词**：报告里的提示词是通用写法，不同模型的写法不一样（分镜头怎么写、参考图怎么指代、台词怎么写都不同）。"
               "生成前按你实际用的模型的官方提示词指南改一遍，或者让 agent 用这个模型的提示词 skill 优化",
               "**Adapt the prompts to your model**: the prompts in this report are generic, and every model reads them differently (how shots are "
               "split, how references are addressed, how dialogue is written). Before generating, rewrite them following the official prompt guide "
               "of the model you actually use, or have the agent refine them with that model's prompting skill")
             + (T("；按 {m} 写的要点在「AI 生成」开头", "; notes for {m} at the top of “AI generation”", m=m) if m and plan.get("prompting") else ""))
    return L


def _drive(b: dict) -> str | None:
    drive = (b.get("production_plan") or {}).get("drive") or []
    if not drive:
        return None
    if not model_chosen(b):
        n = sum(len(u["shots"]) for u in drive)
        return T("**动作镜头**：{n} 个舞蹈 / 动作镜头要拿原片当动作驱动来生成，先选模型再出路线（`rea-video plan <拆解目录> --model <模型>`）",
                 "**Motion shots**: {n} dance / action shots to generate driven by the source motion; pick the model first "
                 "(`rea-video plan <folder> --model <model>`)", n=n)
    n = sum(len(u["shots"]) for u in drive)
    s = sum(u["duration"] for u in drive)
    k = sum(u["segments_est"] for u in drive)
    kling = all(u["movers"] < 2 and len(u["shots"]) == 1 and u["full_body"] is not False and not u["camera_moves"] for u in drive)
    tool = T("Kling 动作控制或 Seedance 2.5", "Kling Motion Control or Seedance 2.5") if kling else T("Seedance 2.5 全能参考", "Seedance 2.5 omni-reference")
    first = drive[0]
    how = (T("直接拿原片当参考视频（{t}）", "the source clip as the reference video ({t})", t=tool) if first["pick"]["key"] == "ref"
           else T("深度视频驱动（`rea-video drive --depth`）", "a depth-video drive (`rea-video drive --depth`)"))
    return T("**动作驱动**：{n} 镜（{s:.0f} 秒）的动作用原片当驱动，不用首尾帧生成。`rea-video drive <报告目录>` 擦掉字幕、在停顿处切成约 {k} 段；"
             "一张角色设定图贯穿每段；这条先用{h}。{w}。新场景和原片差很多时改深度视频，连空间、机位都要换时做白模；每段的路线和提示词见下方「动作驱动」",
             "**Motion drive**: the moves of {n} shot{p} ({s:.0f} s) are driven from the source, not generated from frames. `rea-video drive <report folder>` "
             "erases the captions and cuts about {k} segments at calm moments; one character sheet for every segment; start with {h}. {w}. If the new setting "
             "is far from the original, switch to a depth video, and to clay when the space and camera change too; routes and prompts per unit under “Motion drive” below",
             n=n, p="" if n == 1 else "s", s=s, k=k, h=how, w=first["pick"]["why"])


def _shoot_few(b: dict) -> str | None:
    """A handful of live shots inside a generated video: point at the plan instead of measuring the whole film as if it were shot."""
    shoot = (b.get("production_plan") or {}).get("shoot") or []
    if not shoot or _all_generated(b):
        return None
    n = sum(len(x.get("shots") or []) for x in shoot)
    return T("**实拍镜头**：{n} 个镜头要自己拍，机位和布光见下方「拍摄」", "**Live shots**: {n} shots to film yourself; camera and light under “Shoot” below", n=n)


def _avatar(b: dict) -> str | None:
    av = (b.get("production_plan") or {}).get("avatar") or []
    if not av:
        return None
    return T("**数字人**：{k} 段数字人口播，形象、音色和每段台词见下方「AI 生成」", "**Avatar**: {k} avatar segments; face, voice and lines per segment under “AI generation” below", k=len(av))


def _code(b: dict) -> str | None:
    if not (b.get("production_plan") or {}).get("code"):
        return None
    return T("**动效画面**：让 agent 跑 `rea-video code-remake` 出一版能改的工程，在它上面换文字和画面，不要从零写；"
             "第一版只是起点，和原片差在哪见「代码合成」",
             "**Motion graphics**: have the agent run `rea-video code-remake` for an editable first version and change the text and pictures "
             "on top of it rather than starting from scratch; the first version is only a start, where it differs from the original is under “Code build”")


def _local(b: dict) -> str | None:
    if not (b.get("production_plan") or {}).get("local"):
        return None
    return T("**静图推拉**：换成自己的图，`rea-video remake` 会按原片的推拉方向和速度自动做出来",
             "**Stills with moves**: swap in your images; `rea-video remake` moves them the way the original does")


def _footage(b: dict) -> str | None:
    if not (b.get("production_plan") or {}).get("footage"):
        return None
    return T("**影视片段**：要用到的片段和时长见下方「影视原片」；用别人的影视画面要先确认有没有使用权",
             "**Film clips**: the clips and lengths are under “Film / TV source” below; check that you have the right to use them")


def _voice(b: dict) -> str | None:
    if not ((b.get("audio") or {}).get("voice") or {}).get("present"):
        return None
    if ((b.get("sound_sources") or {}).get("voice") or {}).get("source") == "ai_video_native" and _units(b):
        return None  # generated with the picture: the generate step says so
    src = _src(b, "voice")
    k = len(entities.script(b))
    acted = performance.table(b)[0]
    src = src.strip()
    if src in (T("待确认", "to confirm"),) or src.startswith(T("待确认", "to confirm")):
        bits = [T("原片人声的来源待确认", "where the original voice comes from is to confirm")]
    else:
        bits = [T("原片是{sp}{s}", "the original is {s}", s=src, sp=" " if src[:1].isascii() else "")] if src else []
    bits.append(T("自己录或用 TTS 配", "record it yourself or use TTS"))
    if k:
        bits.append(T("{k} 句台词和每句的语速在「声音」的脚本表", "{k} lines with their pace in the script table under “Sound”", k=k))
    if acted:
        bits.append(T("语气照「表演与情绪」", "delivery per “Acting and emotion”"))
    return T("**配音**：", "**Voice**: ") + T("；", "; ").join(bits)


def _edit_detail(b: dict) -> list[str]:
    """The measured editing facts that say something: no zero counts, no pause-cutting without speech."""
    e = _aspect(b, "editing")
    talk = ((b.get("audio") or {}).get("voice") or {}).get("present")
    single = int((b.get("summary") or {}).get("shots") or 0) <= 1
    out = []
    for part in e.split(T("；", "; "))[1:]:
        p = part.strip()
        if not p or re.search(r"(?<![\d.])0(\.0)? ?(处|个|%|cuts?|setups?|scenes?)", p) or ((T("说话停顿", "pause") in p) and not talk):
            continue
        if p in (T("没有实拍镜头", "no live-action shots"),) or (single and re.search(r"\b1 ?(个|setup|scene)", p)):
            continue
        out.append(p)
    return out


def _edit(b: dict) -> str:
    trans = {k: v for k, v in ((b.get("summary") or {}).get("transitions") or {}).items() if k not in ("start", "cut")}
    return (T("**剪辑**：按分镜表的顺序和时长剪，{c}", "**Edit**: follow the order and lengths in the shot list; {c}", c=_cut(b))
            + (T("；{n} 处转场在「剪辑」", "; {n} transitions under “Edit”", n=sum(trans.values())) if trans else ""))


def _packaging(b: dict) -> str | None:
    pk = (b.get("summary") or {}).get("packaging") or []
    files = (b.get("packaging") or {}).get("files") or {}
    subs = [c for c in (b.get("packaging") or {}).get("text_cues") or [] if c.get("kind") == "subtitle"]
    if not pk and not subs:
        return None
    bits = []
    if subs and files.get("srt"):
        sub = next((x for x in pk if x.startswith(T("字幕", "Subtitle"))), "")
        style = _first(sub) if sub else ""
        style = T("、", ", ").join(w for w in re.split(r"[、,]\s*", style) if not re.search(r"字高|height", w))
        bits.append(T("字幕导入 `{f}` 换成自己的话", "import `{f}` and replace the words", f=files["srt"])
                    + (T("，样式：{s}", ", style: {s}", s=style) if style else ""))
    # counts only ("花字 5 处"), as the verdict states them; what each one is stays under “Packaging layer”
    verdict = str((b.get("summary") or {}).get("verdict") or "")
    rest = [x.strip() for x in re.split(r"[、,]\s*", verdict.split(T("剪辑包装：", "editing package: "))[-1])
            if x.strip().startswith((T("花字", "styled"), T("标题", "title"), T("贴纸", "sticker"))) and re.search(r"\d", x)] if T("剪辑包装：", "editing package: ") in verdict else []
    if rest:
        bits.append(T("、", ", ").join(rest))
    bits.append(T("时间和样式在「剪辑包装层」", "timing and style under “Packaging layer”"))
    return T("**字幕和花字**：", "**Subtitles and styled text**: ") + T("；", "; ").join(bits)


def _music(b: dict) -> str | None:
    audio = b.get("audio") or {}
    m = audio.get("music") or {}
    if not m.get("present"):
        return None
    bits = []
    src = _src(b, "music")
    if src:
        bits.append(T("来源{s}", "source: {s}", s=src))
    bpm = audio.get("tempo_bpm") or m.get("tempo_bpm")
    if bpm:
        bits.append(T("约 {b:.0f} BPM", "about {b:.0f} BPM", b=float(bpm)))
    key = m.get("key") or {}
    if key.get("tonic") and float(key.get("confidence") or 0) >= 0.6:
        bits.append(T("{t} {m}", "{t} {m}", t=key["tonic"], m=T("大调", "major") if key.get("mode") == "major" else T("小调", "minor")))
    if audio.get("beat_synced_edit"):
        bits.append(T("切镜卡在节拍上", "cuts land on the beat"))
    x = T("，", ", ").join(bits) or T("有配乐", "music present")
    if dance.is_motion_video(b):  # the moves were set to this track: another song moves every hit
        return T("**配乐**：{x}；动作是踩着这首歌编的，用原曲（商用先确认版权）或同 BPM、重拍位置一样的曲子，生成和拼回都对着它",
                 "**Music**: {x}; the moves were set to this song, so use it (check the rights for commercial use) or one at the same BPM with the "
                 "accents in the same places, and generate and assemble against it", x=x)
    return T("**配乐**：找同速度、同情绪的曲子（{x}）", "**Music**: find a track at the same tempo and mood ({x})", x=x)


def _sfx(b: dict) -> str | None:
    sfx = [e for e in (b.get("audio_plan") or {}).get("sfx_merged", []) if not e.get("in_scene")]
    if not sfx:
        return None
    return T("**音效**：{k} 处，按「声音」里的时间点从音效库找同类的放上", "**Sound effects**: {k}; place similar ones from a library at the times under “Sound”",
             k=len(sfx))


def _assemble() -> str:
    return T("**拼回对照**：做好的镜头交给 agent 跑 `rea-video remake`，拼回原时间线（没做的先用原片占位），出一条和原片并排的对比片",
             "**Put it together and compare**: hand the shots you made to the agent; `rea-video remake` places them on the original timeline, keeps the original where yours are missing, and renders a side-by-side comparison with the original")


# Kinds with their own order. "content" and "material" stand for the per-video steps filled in by steps().
_ORDER_SPEC: dict[str, list] = {
    "beat": [_music, "material", _edit, _packaging],
    "film": ["material", _footage, "content", _voice, _edit, _packaging, _music],
    "explainer": ["content", "material", _voice, _code, _local, _packaging, _music, _sfx],
    "screen": ["content", "material", _voice, _edit, _packaging, _music],
    "slideshow": ["content", "material", _voice, _local, _edit, _packaging, _music],
    "avatar": ["content", "material", _voice, _avatar, _edit, _packaging, _music],
    "ai_mv": [_music, "content", "material", _generate, _shoot_few, _local, _edit, _packaging, _sfx],  # the picture follows the song
    "dance": [_music, "material", _drive, _shoot, _generate, _edit, _packaging, _sfx],  # the moves were set to the track
}


def steps(b: dict, kind: str, also: str | None = None) -> list[str]:
    """The steps for this video in the order its kind is made; only steps with data behind them appear.
    `also`: a second kind covering a good part of the time; then every making step with data is listed."""
    live = kind in _LIVE_KINDS and not also
    content, mat = _content(b), _material(b, live, refs=kind in _GENERATED_KINDS + ("dance",) or bool(also))
    spec = None if also else _ORDER_SPEC.get(kind)
    order = [{"content": content, "material": mat}.get(x, x) if isinstance(x, str) else x for x in spec] if spec else None
    if order is None:
        if live:
            order = [content, mat, _shoot, _generate, _drive, _voice, _edit, _packaging, _music, _sfx]
        else:  # a few live shots inside a generated video get one pointer; a real live share gets the full shoot steps
            shoot = _shoot if also in _LIVE_KINDS or kind in _LIVE_KINDS else _shoot_few
            order = [content, mat, _generate, _drive, _avatar, shoot, _code, _local, _voice, _edit, _packaging, _music, _sfx]
    out: list[str] = []
    for x in order:
        got = x(b) if callable(x) else x
        for line in got if isinstance(got, list) else [got]:
            if line and line not in out:
                out.append(line)
    return out + [_assemble()]


def md(b: dict) -> list[str]:
    """The hands-on part of the remake section: the kind of video, then numbered steps built from this breakdown."""
    ks = kinds(b)
    if not ks:
        return []
    main = ks[0][0]
    L = [T("这条属于「{k}」。按下面的顺序做，每步要的细节在后面对应的小节里。",
           "This is a {k}. Do the steps in this order; the detail for each is in the matching subsection below.", k=NAME_ZH[main])]
    if len(ks) > 1:
        L[0] += T("另有 {p:.0%} 的时长是「{k}」，步骤里一起列了。", " {p:.0%} of the time is a {k}; its steps are included.", p=ks[1][1], k=NAME_ZH[ks[1][0]])
    L.append("")
    L += [f"{i}. {x}" for i, x in enumerate(steps(b, main, also=ks[1][0] if len(ks) > 1 else None), 1)]
    return L + [""]
