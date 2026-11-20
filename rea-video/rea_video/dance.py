"""Motion-led shots (dance, fights, workouts): the moves are the point, and words cannot carry them.

First / last frame generation pins two moments and leaves the choreography in between to the model, so a dance
remade that way keeps the look and loses the dance. What works is driving the new picture from the source motion:

  ref    the source clip itself as the motion reference (Kling Motion Control, Seedance 2.5 reference video, Wan Animate)
  depth  the source turned into a grey depth video: moves, blocking, space and camera stay, the original person's
         face, clothes and set go (Video Depth Anything, then a reference-video model or Wan VACE)
  pose   a skeleton video: only the joints travel, so a very different body (chibi, animal, cartoon) keeps its shape
  clay   monocular mocap to FBX / BVH, a clay figure in Blender with a new camera, then a clay-render reference
  shoot  for a filmed original: dance it yourself in the same framing, then swap or restyle if wanted

Which shots are motion-led comes from the image readers (performance.move: the agent's review or the VLM);
nothing in the pixels separates a dance from someone walking about. The drive clips themselves (captions
removed, cut at calm moments near beats) are written by `rea-video drive` (drive.py).
"""
from __future__ import annotations

from . import performance
from .i18n import LangDict, T, join, semi, shot_ids

MOTION_LABELS = ("live_action", "ai_video", "cg_3d", "anim_2d")
GENERATED = ("ai_video", "cg_3d", "anim_2d")
MOVE_ZH = LangDict({"dance": "舞蹈", "fight": "打斗", "sport": "健身 / 运动"}, en={"dance": "dance", "fight": "fight", "sport": "workout / sport"})
PRODUCT_KINDS = ("product_photo", "logo")
TALK = 0.5  # share of a shot under speech or singing past which small movements are lip-sync / avatar work
_MOVING = ("smooth_move", "handheld_like")
SEGMENT = {"prefer": 10.0, "max": 15.0, "min": 3.0}


def segment_limits() -> dict:
    from .plan import _load

    try:
        got = ((_load("routing.yaml").get("segmentation") or {}).get("defaults") or {}).get("motion_segment_s") or {}
    except (OSError, ValueError):
        got = {}
    return {k: float(got.get(k, v)) for k, v in SEGMENT.items()}


def _product(rec: dict) -> bool:
    m = rec.get("material") or {}
    return any(it.get("kind") in PRODUCT_KINDS for it in (m.get("items") or []) + (m.get("references") or []))


def _talking(rec: dict, p: dict | None) -> bool:
    """Most of the shot is under a voice that belongs to the person on screen. Sung vocals are usually the song the
    dance is set to, so they count only when a reader heard the person in the shot sing (performance.voice). In a
    music video the people are mostly singing the song, and its vocals are found only in part, so every shot counts;
    a full-body dance passes either way."""
    if rec.get("song_video"):  # the whole video is a song, and vocal detection misses much of a sung track
        return True
    if float(rec.get("talk_share") or 0) < TALK:
        return False
    return not rec.get("sung") or bool((p or {}).get("voice"))


def guard(rec: dict) -> str:
    """Why a shot is not driven from the source motion even if a reader marked it, "" when nothing stops it.
    Product shots are selling, not choreography; a shot mostly under speech or singing without the whole body in
    frame is a talking / singing performance that a lip-sync or avatar model already reproduces."""
    if _product(rec) or rec.get("product_video"):
        return T("带货 / 商品镜头", "product / selling shot")
    p = performance.of(rec) or {}
    if _talking(rec, p) and p.get("full_body") is not True:
        return T("边说或边唱、不是全身大动作：对口型或数字人就能做", "talking or singing without full-body moves: lip sync or an avatar does it")
    return ""


def mark(b: dict) -> None:
    """Stamp what the guard needs from the whole video: how much of each shot is under a voice, whether that voice
    is sung, and whether the video is a product / desk video."""
    segs = ((b.get("audio") or {}).get("voice") or {}).get("segments") or [] if ((b.get("audio") or {}).get("voice") or {}).get("present") else []
    from .aspects.base import video_seen
    from .entities import cast

    # only what a reader said: the measured format calls a small, masked, full-body dancer "handheld product"
    seen = " ".join(video_seen(b, "format", "format").values())

    ctx = (b.get("sound_sources") or {}).get("format_context") or {}
    sung = ctx.get("vocal_style") == "singing"
    song = ctx.get("video_type") == "music_mv"  # the whole video is a song: the people in it are mostly singing it
    shop = any(w in seen for w in ("带货", "开箱", "商品", "桌面", "unboxing", "product", "tabletop")) \
        or any(c.get("kind") == "product" for c in cast(b).get("characters") or [])
    for r in b.get("shots", []):
        d = r.get("duration") or 0
        over = sum(max(0.0, min(r["end"], z) - max(r["start"], a)) for a, z in segs)
        r["talk_share"] = round(over / d, 3) if d else 0.0
        r["product_video"] = shop
        r["sung"] = sung
        r["song_video"] = song


def segment_count(dur: float, lim: dict) -> int:
    """How many drive segments a stretch is cut into: as few as the maximum allows, about the preferred length each."""
    import math

    return max(math.ceil(dur / lim["max"] - 1e-6), round(dur / lim["prefer"]), 1)


def move_of(rec: dict) -> dict | None:
    """The shot's performance when its motion is the point (a reader set performance.move and no guard stops it), else None."""
    if (rec.get("base") or {}).get("label") not in MOTION_LABELS:
        return None
    p = performance.of(rec)
    return p if p and p.get("move") and not guard(rec) else None


def motion_indices(b: dict) -> set[int]:
    return {r["index"] for r in b.get("shots", []) if move_of(r)}


def share(b: dict) -> float:
    total = sum(r["duration"] for r in b.get("shots", [])) or 1.0
    return sum(r["duration"] for r in b.get("shots", []) if move_of(r)) / total


def is_motion_video(b: dict) -> bool:
    return share(b) >= 0.5


def maybe_motion(rec: dict, b: dict) -> bool:
    """A hint for the image reader, not a verdict: a long shot with a lot of local motion over music, not a product
    shot and not mostly speech (sung vocals are the song). Fights, crowds and handheld walks look the same in these
    numbers, so it only asks the reader to look."""
    if (rec.get("base") or {}).get("label") not in MOTION_LABELS or rec.get("duration", 0) < 3 or _product(rec) or rec.get("product_video"):
        return False
    if float(rec.get("talk_share") or 0) >= TALK and not rec.get("sung"):  # mostly speech: a talk, not a dance
        return False
    f = rec.get("features") or {}
    return (float(f.get("local_motion_ratio") or 0) >= 0.2 and f.get("camera") != "planar_zoom_pan"
            and bool(((b.get("audio") or {}).get("music") or {}).get("present")))


def _runs(b: dict) -> list[list[dict]]:
    """Consecutive motion-led shots: one dance cut into several takes is still one piece of choreography."""
    runs, cur = [], []
    for r in b.get("shots", []):
        if move_of(r) and (not cur or abs(cur[-1]["end"] - r["start"]) < 0.05):
            cur.append(r)
            continue
        if cur:
            runs.append(cur)
        cur = [r] if move_of(r) else []
    if cur:
        runs.append(cur)
    return runs


def _beats(b: dict, a: float, z: float) -> list[float]:
    return [t for t in ((b.get("audio") or {}).get("music") or {}).get("beats") or [] if a <= t <= z]


def _bpm(b: dict) -> float | None:
    audio = b.get("audio") or {}
    v = audio.get("tempo_bpm") or (audio.get("music") or {}).get("tempo_bpm")
    return float(v) if v else None


def _cast_bits(b: dict, shots: set[int]) -> tuple[list[dict], str]:
    """(characters seen in these shots, the scene's look) from the readers' cast."""
    from .entities import cast

    c = cast(b)
    who = [x for x in c.get("characters") or [] if set(x.get("shots") or []) & shots and x.get("kind") in ("person", "animal", "cartoon", "avatar", "")]
    scene = next((s.get("look") or s.get("where") or "" for s in c.get("scenes") or [] if set(s.get("shots") or []) & shots), "")
    return who, scene


def _routes(u: dict) -> list[dict]:
    """The ways to drive this run, best fit first, each with when it fits, the tools and what to feed."""
    multi, takes, moving, full = u["movers"] >= 2, len(u["shots"]), u["camera_moves"], u["full_body"]
    cartoon = any(c.get("kind") in ("cartoon", "animal") for c in u["who"])
    kling_off = [w for w, bad in ((T("原片多人同时跳，只会取画面里最大的那个人", "several people move at once; it only takes the largest person"), multi),
                                  (T("原片中间有剪辑，要一镜到底的段落", "the source has cuts; it needs single-take segments"), takes > 1),
                                  (T("原片手脚或头常出画，要头到脚都在画面里", "head, hands or feet leave the frame; it needs the whole body in view"), full is False),
                                  (T("原片有运镜，它的参考视频最好是固定机位", "the source camera moves; its reference works best locked off"), moving)) if bad]
    ref = {"key": "ref", "name": T("原片当参考视频（动作迁移）", "Source clip as the motion reference (motion transfer)"),
           "when": T("原片背景干净、新场景和原片差不多，或神态要一起复刻时：动作、节拍、走位和表情一次带过去，最省事",
                     "when the source background is clean and the new setting is close to it, or the expression must come across too: moves, timing, "
                     "blocking and face in one go, the least work"),
           "tools": [T("Kling 动作控制：单人、全身、一镜到底最稳；3.0 可以绑定脸", "Kling Motion Control: steadiest with one person, full body, single take; 3.0 can bind a face")
                     + (T("（这条不太合适：{w}）", " (a poor fit here: {w})", w=semi().join(kling_off)) if kling_off else ""),
                     T("Seedance 2.5 全能参考：多人、带运镜、中间有剪辑都能喂；参考视频合计 ≤30 秒，首帧和参考不能同传",
                       "Seedance 2.5 omni-reference: takes several dancers, camera moves and cuts; reference videos ≤30 s in total, and no first frame alongside references"),
                     T("Wan 2.2 Animate / Wan-Animate-2：开源，本地显卡跑，也能在原片里直接换人",
                       "Wan 2.2 Animate / Wan-Animate-2: open weights on your own GPU; can also replace the person inside the source")],
           "feed": T("驱动视频 `drive/seg_XX.mp4` + 角色图", "drive clip `drive/seg_XX.mp4` + character image")}
    depth = {"key": "depth", "name": T("深度视频当驱动", "Depth video as the driver"),
             "when": T("原片背景杂乱（街道、人群、杂物），或新场景和原片差很多：只留动作、空间和运镜，原背景和原来的人一点不带；表情会丢",
                       "when the source background is busy (street, crowd, clutter) or the new setting is far from it: only moves, space and camera are kept, "
                       "nothing of the old background or person; the expression is lost"),
             "tools": [T("Video Depth Anything 出灰度深度视频（Small 版可商用），或 `rea-video drive --depth`",
                         "Video Depth Anything makes the grey depth video (the Small model allows commercial use), or `rea-video drive --depth`"),
                       T("再把深度视频当参考视频喂 Seedance 2.5，或当控制视频喂 Wan VACE",
                         "then feed it to Seedance 2.5 as the reference video, or to Wan VACE as the control video")],
             "feed": T("深度视频 `drive/seg_XX_depth.mp4` + 角色设定图", "depth video `drive/seg_XX_depth.mp4` + character sheet")}
    pose = {"key": "pose", "name": T("骨骼视频当驱动", "Skeleton video as the driver"),
            "when": T("新角色和原舞者体型差很多（Q 版、动物、卡通）：深度会把原来的身形带过去，骨骼只带关节",
                      "when the new character's build is far from the dancer's (chibi, animal, cartoon): depth carries the old silhouette, a skeleton only the joints"),
            "tools": [T("DWPose 出骨骼视频（ComfyUI controlnet_aux 节点），接 Wan VACE + 角色参考图",
                        "DWPose makes the skeleton video (ComfyUI controlnet_aux node), into Wan VACE with the character reference")],
            "feed": T("骨骼视频 + 角色图", "skeleton video + character image")}
    clay = {"key": "clay", "name": T("动捕转白模再生成", "Mocap to a clay figure, then generate"),
            "when": T("新场景连空间、机位都要换，或这套动作要反复用、在 3D 里改：画面里只有一个动的白模；最费事，表情会丢",
                      "when even the space and camera change, or the moves will be reused or edited in 3D: nothing but a moving clay figure; the most work, and the expression is lost"),
            "tools": [T("Rokoko Vision 等单目动捕出 FBX / BVH → Blender 绑到白模，重设机位渲染白模视频",
                        "monocular mocap such as Rokoko Vision to FBX / BVH → a clay figure in Blender, re-camera and render the clay video"),
                      T("白模视频当参考视频喂 Seedance 2.5（白模参考），提示词写「参考白模的站位、动作和运镜」",
                        "feed the clay video to Seedance 2.5 as the reference (clay render reference), prompting “follow the clay figure's blocking, moves and camera”")],
            "feed": T("白模渲染视频 + 角色图", "clay render video + character image")}
    order = [ref, pose, depth, clay] if cartoon else [ref, depth, clay, pose]
    first = next(r for r in order if r["key"] == u["pick"]["key"])
    order = [first] + [r for r in order if r is not first]
    if u["live"]:
        order.append({"key": "shoot", "name": T("自己跳 / 找人跳", "Dance it yourself / cast a dancer"),
                      "when": T("原片是实拍；照「拍摄」的机位和布光拍，跟着原曲练到卡点再拍",
                                "the original is filmed; shoot with the setup under “Shoot”, rehearse to the original track until the hits land"),
                      "tools": [T("要换成别的人或画风：拍好后用视频编辑模型换人 / 风格化，保留动作", "to change the person or look: swap or restyle the take with a video-editing model, keeping the moves")],
                      "feed": T("自己拍的素材", "your own footage")})
    return order


_NO_FACE = ("看不清", "看不到", "看不见", "遮", "口罩", "背对", "模糊", "not visible", "hidden", "covered", "mask", "blurred", "from behind")


def _face_seen(p: dict) -> bool:
    """The reader describes a face that can actually be seen (not "masked", "from behind", "too blurred")."""
    f = str(p.get("face") or "").lower()
    return bool(f) and not any(w in f for w in _NO_FACE)


def pick(u: dict) -> dict:
    """The route to start from, decided by what this video shows: does the face carry the shot (only the source clip
    brings it across; depth, skeletons and clay keep the body alone) and is the background behind the dancer busy
    (a raw reference drags it, and passers-by, into the new picture). How far the new setting is from the old one
    is the user's call, so the report asks it next to this pick."""
    if u["face_matters"]:
        return {"key": "ref", "why": T("神态是看点：只有直接拿原片当参考，表情才会一起带过去，深度、骨骼和白模都只留身体",
                                       "the expression matters: only the source clip itself carries the face across; depth, skeletons and clay keep the body alone")
                + (T("。原背景杂乱：提示词写明不参考背景、场景用参考图给；还是带出原背景时，再改深度驱动 + 脸部特写参考图（Kling 3.0 可以绑脸），表情写进提示词",
                     ". The background is busy: say in the prompt not to follow the background and give the setting as a reference image; if it still leaks, "
                     "switch to a depth drive + a face close-up reference (Kling 3.0 can bind a face) and write the expression into the prompt")
                   if u["backdrop"] == "busy" else "")}
    if u["backdrop"] == "busy":
        return {"key": "depth", "why": T("原背景杂乱、神态不是看点：直接参考容易把原背景和路人一起带过来，深度视频只留动作、空间和运镜",
                                         "busy background and the face is not the point: a raw reference tends to bring the old background and passers-by along; "
                                         "a depth video keeps only moves, space and camera")}
    return {"key": "ref", "why": T("原背景干净、神态不是看点：直接拿原片当参考视频就够，不用转深度或做白模",
                                   "clean background and the face is not the point: the source clip as the reference is enough, no depth or clay needed")
            if u["backdrop"] == "clean" else
            T("先直接拿原片当参考视频；背景杂不杂还没看图确认，杂的话改深度视频",
              "start with the source clip as the reference; whether the background is busy is not confirmed yet, and if it is, switch to a depth video")}


def _prompts(u: dict) -> dict[str, str]:
    """Prompt templates per route, filled with this run's measured and seen facts; <> marks what the user decides."""
    move = MOVE_ZH[u["move"]]
    who = u["who"][0].get("name") if u["who"] else ""
    look = u["who"][0].get("look") if u["who"] else ""
    outfit = T("<你的角色穿什么，写具体>", "<what your character wears, specifically>")
    scene = u["scene"] or T("<场景>", "<setting>")
    frame = u["framing"]
    beat = T("，跟着 {b:.0f} BPM 的节拍", " on the {b:.0f} BPM beat", b=u["bpm"]) if u.get("bpm") else ""
    many = T("。多人：C 位用 @图片1，其余从左到右 @图片2、@图片3…，站位和原片一致",
             ". Several dancers: the centre one is @图片1, the rest left to right @图片2, @图片3…, in the same formation as the source") if u["movers"] >= 2 else ""
    return {
        "seedance": T("@视频1 只参考{m}动作、走位、运镜和节拍，不参考人物外观、服装和场景。@图片1 的角色一比一做出 @视频1 里{w}的全部动作{beat}，"
                      "动作幅度、朝向和在画面里的位置保持一致{many}。{f}。角色穿{o}。场景：{s}。",
                      "Use @视频1 only for the {m} moves, blocking, camera and timing, not for the person's look, clothes or setting. The character in @图片1 "
                      "performs every move of {w} in @视频1 one to one{beat}, with the same size of movement, facing and place in frame{many}. {f}. "
                      "The character wears {o}. Setting: {s}.",
                      m=move, w=who or T("原舞者", "the dancer"), beat=beat, many=many, f=frame, o=outfit, s=scene),
        "kling": T("（Kling 只写画面，不写动作）{look}，穿{o}，{s}", "(Kling takes the picture only, not the moves) {look}, wearing {o}, {s}",
                   look=look or T("<角色外观>", "<character look>"), o=outfit, s=scene),
        "depth": T("@视频1 是深度视频，是动作、节奏、空间和运镜的最高优先参考：动作不改，不加新的运镜。角色以 @图片1 为准，穿{o}。场景：{s}。{f}。",
                   "@视频1 is a depth video and the top reference for moves, timing, space and camera: do not redesign the moves, do not add camera "
                   "movement. The character follows @图片1, wearing {o}. Setting: {s}. {f}.", o=outfit, s=scene, f=frame),
    }


def units(b: dict) -> list[dict]:
    """One drive unit per run of motion-led shots."""
    from .plan import framing_words

    lim = segment_limits()
    out = []
    for run in _runs(b):
        ids = {r["index"] for r in run}
        perfs = [move_of(r) or {} for r in run]
        kinds: dict[str, float] = {}
        for r, p in zip(run, perfs):
            kinds[p["move"]] = kinds.get(p["move"], 0.0) + r["duration"]
        fulls = [p.get("full_body") for p in perfs if p.get("full_body") is not None]
        who, scene = _cast_bits(b, ids)
        a, z = run[0]["start"], run[-1]["end"]
        dur = round(z - a, 3)
        u = {"id": f"M{len(out) + 1}", "kind": "drive", "shots": [r["index"] for r in run], "start": round(a, 3), "end": round(z, 3),
             "duration": dur, "move": max(kinds.items(), key=lambda kv: kv[1])[0],
             "movers": max([p.get("movers") or 1 for p in perfs] or [1]),
             "full_body": (all(fulls) if fulls else None),
             "backdrop": ("busy" if any(p.get("backdrop") == "busy" for p in perfs) else
                          "clean" if any(p.get("backdrop") == "clean" for p in perfs) else None),
             "face_matters": any(_face_seen(p) and (p.get("key") or p.get("arc") or p.get("intensity") in ("mid", "high")) for p in perfs),
             "camera_moves": any((r.get("features") or {}).get("camera") in _MOVING for r in run),
             "live": any(r["base"]["label"] == "live_action" for r in run),
             "labels": list(dict.fromkeys(r["base"]["label"] for r in run)),
             "bpm": _bpm(b), "beats": len(_beats(b, a, z)),
             "segments_est": segment_count(dur, lim),
             "framing": framing_words(run[0])[0], "who": [{k: c.get(k) for k in ("id", "name", "kind", "look")} for c in who],
             "scene": scene, "body": semi().join(dict.fromkeys(p.get("body") for p in perfs if p.get("body")))}
        u["pick"] = pick(u)
        u["routes"] = _routes(u)
        u["prompts"] = _prompts(u)
        out.append(u)
    return out


def summary_bit(drive: list[dict]) -> str:
    n = sum(len(u["shots"]) for u in drive)
    s = sum(u["duration"] for u in drive)
    return T("{k} {n} 镜（{s:.0f} 秒）→ {u} 段动作驱动", "{k} {n} shot{p} ({s:.0f} s) → {u} motion-drive unit{q}",
             k=join(dict.fromkeys(MOVE_ZH[u["move"]] for u in drive)), n=n, p="" if n == 1 else "s", s=s, u=len(drive), q="" if len(drive) == 1 else "s")


def report_md(drive: list[dict], lim: dict | None = None) -> list[str]:
    """The "Motion drive" part of the remake plan."""
    if not drive:
        return []
    lim = lim or segment_limits()
    L = ["", T("### 动作驱动", "### Motion drive"), "",
         T("这些镜头的看点是动作本身。只给首尾帧，中间的动作全靠模型猜，编舞和卡点会丢；要用原片这段动作去驱动新画面。",
           "The moves are the point of these shots. First and last frames pin only two moments and leave the choreography to the model, "
           "so the dance and the hits get lost; drive the new picture from the source motion instead."), "",
         T("1. **出驱动视频**：`rea-video drive <报告目录>`：擦掉字幕和贴纸（不擦会被当成画面学进去），在动作停顿、靠近拍点的地方切成 {p:.0f}–{mx:.0f} 秒的短段"
           "（短段手脚和转身更稳），每段一个 `drive/seg_XX.mp4`；要走深度路线时加 `--depth`",
           "1. **Make the drive clips**: `rea-video drive <report folder>` erases subtitles and stickers (left in, they are learned as part of the picture) and cuts "
           "the motion into {p:.0f}–{mx:.0f} s segments at calm moments near a beat (hands, feet and turns hold up better in short segments), one "
           "`drive/seg_XX.mp4` each; add `--depth` when going the depth route", p=lim["prefer"], mx=lim["max"]),
         T("2. **角色图**：同一套衣服出一张角色设定图（正面、正侧面、背面全身 + 脸部特写），每段都用这一张；Kling 用正面全身图，景别和朝向对齐 `drive/seg_XX_first.jpg`",
           "2. **Character image**: one character sheet in one outfit (front, strict side and back full body + a face close-up), the same one for every "
           "segment; for Kling use the front full-body image, matched to the framing and facing of `drive/seg_XX_first.jpg`"),
         T("3. **逐段生成**：多数情况直接拿驱动视频当参考就行；原背景杂乱、新场景差很多才转深度或做白模，神态要复刻就留在直接参考。每个单元下面按这几点给了建议和提示词；服装要在提示词里写明，不写会变回原舞者的衣服",
           "3. **Generate segment by segment**: usually the drive clip as the reference is all it takes; go to depth or clay only when the background is busy or the new "
           "setting is far off, and stay with the direct reference when the expression must come across. Each unit below gives the pick and the prompts; name the "
           "outfit in the prompt, or it drifts back to the dancer's clothes"),
         T("4. **接回去**：生成结果写进 `drive/results.json`（`{\"seg_01\": \"绝对路径\"}`），跑 `rea-video drive <报告目录> --join` 按段拼好、按镜头切开写进 "
           "`remake/mine.json`，再 `rea-video remake <报告目录>` 出和原片并排的对比片，对着原曲看卡点",
           "4. **Put it back**: list the results in `drive/results.json` (`{\"seg_01\": \"absolute path\"}`), run `rea-video drive <report folder> --join` to join "
           "the segments, cut them per shot and write `remake/mine.json`, then `rea-video remake <report folder>` for the side-by-side, and check the hits against the original track"),
         T("5. **检查**：手指和脚（快动作、转身处最容易坏）、脸有没有变、衣服有没有变回去、段与段接缝；哪段坏就把那段再切短重做，一次只改一样",
           "5. **Check**: fingers and feet (they break first on fast moves and turns), whether the face drifts, whether the clothes revert, the seams between "
           "segments; redo a bad segment shorter, changing one thing at a time"), "",
         T("| 单元 | 镜头 | 时间 | 动作 | 人数 | 全身入画 | 机位 | 约几段 |", "| Unit | Shots | Time | Moves | People | Full body | Camera | Segments |"),
         "|---|---|---|---|---|---|---|---|"]
    yes_no = {True: T("是", "yes"), False: T("否", "no"), None: "—"}
    for u in drive:
        L.append(f"| {u['id']} | {shot_ids(u['shots'])} | {u['start']:.1f}–{u['end']:.1f}s | {MOVE_ZH[u['move']]} | {u['movers']} | "
                 f"{yes_no[u['full_body']]} | {T('有运镜', 'moving') if u['camera_moves'] else T('固定', 'fixed')}"
                 f"{T('，{n} 处剪辑', ', {n} cuts', n=len(u['shots']) - 1) if len(u['shots']) > 1 else ''} | {u['segments_est']} |")
    for u in drive:
        facts = [T("{d:.1f} 秒", "{d:.1f} s", d=u["duration"])]
        if u.get("bpm"):
            facts.append(T("{b:.0f} BPM，段内 {n} 拍", "{b:.0f} BPM, {n} beats", b=u["bpm"], n=u["beats"]))
        if u.get("framing"):
            facts.append(u["framing"])
        L += ["", "<details><summary>" + T("{id} · 镜头 {sh} · {m} · {d:.1f}s", "{id} · shots {sh} · {m} · {d:.1f}s",
                                           id=u["id"], sh=shot_ids(u["shots"]), m=MOVE_ZH[u["move"]], d=u["duration"]) + "</summary>", "",
              T("- 原片：", "- Source: ") + semi().join(facts)]
        if u.get("body"):
            L.append(T("- 动作：{b}", "- Moves: {b}", b=u["body"]))
        bd = {"clean": T("干净", "clean"), "busy": T("杂乱", "busy"), None: T("待看图", "to check")}[u["backdrop"]]
        L += ["", T("怎么选驱动（先看这三点）：", "Choosing the drive (three questions first):"), "",
              T("| 看什么 | 这条原片 | 怎么选 |", "| Question | This video | Choice |"), "|---|---|---|",
              T("| 原片背景杂不杂 | {b} | 干净：直接拿原片当参考视频；杂乱：转深度视频 |", "| Is the background busy | {b} | clean: the source clip as reference; busy: a depth video |", b=bd),
              T("| 神态要不要复刻 | {f} | 要：直接参考原片（深度、骨骼、白模都会丢表情） |", "| Must the expression come across | {f} | yes: the source clip itself (depth, skeleton and clay lose the face) |",
                f=T("要，表情是看点", "yes, it is part of the point") if u["face_matters"] else T("不是看点", "not the point")),
              T("| 新场景和原片差多少 | 你来定 | 差不多：直接参考；差很多：深度视频；连空间、机位都换：白模 |",
                "| How far is the new setting | your call | close: the source clip; far: a depth video; new space and camera too: clay |"),
              T("| 新角色体型 | 你来定 | 和原舞者差很多（Q 版、动物）：骨骼视频 |", "| The new character's build | your call | far from the dancer (chibi, animal): a skeleton video |"),
              "", T("**这条先用：{n}**。{w}", "**Start with: {n}**. {w}", n=u["routes"][0]["name"], w=u["pick"]["why"]),
              "", T("| 路线 | 什么时候用 | 工具 | 要喂的 |", "| Route | When | Tools | Feed |"), "|---|---|---|---|"]
        for r in u["routes"]:
            L.append(f"| {r['name']} | {r['when']} | {'<br>'.join(r['tools'])} | {r['feed']} |")
        L += ["", T("Seedance 2.5 参考视频提示词：", "Seedance 2.5 reference-video prompt:"), "", "```text", u["prompts"]["seedance"], "```",
              "", T("Kling 动作控制（人物朝向选「跟随视频」）：", "Kling Motion Control (character orientation: match the video):"), "", "```text", u["prompts"]["kling"], "```",
              "", T("深度视频驱动：", "Depth-video drive:"), "", "```text", u["prompts"]["depth"], "```", "", "</details>"]
    return L
