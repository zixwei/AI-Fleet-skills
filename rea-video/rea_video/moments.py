"""Special moments: the few seconds a viewer remembers. A magic trick's reveal, a drama's twist or goof, a climax.

What a moment *is* is content, so a reader finds them (the VLM, or an agent that can look at images), coarse to fine:

1. find: the transcript, an overview sheet of the whole video and the tool's hints -> the stretches where something
   special happens, each with its kind and one line on what happens;
2. pin: each stretch as a dense sheet -> the setup, the method window (the move that does it), the change itself and
   the reaction; a change that falls between two tiles gets one more look at every frame in between;
3. explain: each moment from setup to change, close -> 3-6 numbered steps (the key one marked, a point to ring where
   sure), the region to zoom on, what the frames show, what is only a guess, why viewers miss it. These become a frame
   diagram with the change frame by frame, a slow cut of the change and a reveal clip, see reveal.py.

The hints come from sound and picture, measured on what the breakdown already decoded: someone reacting (an
interjection, a surprised / happy voice, laughter, a line louder or higher than that speaker's usual), a short burst
in the vocal stem, a fast move that stops dead (the pose held to show the result). Most candidates are not moments:
they point a reader where to look and are never reported themselves.

Cost: the hints are free (no decode); a reader takes one look at the overview (one sheet per ~4 minutes) and one per
two or three stretches, then one to explain them, so with a VLM about 3-5 calls per video, next to the breakdown's up to 60.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np

from .i18n import LangDict, T
from .util import LOG, fmt_time, read_json, write_json

VERSION = 2
STEP = 0.25            # seconds per hint sample
TOP_HINTS = 24
MAX_MOMENTS = 10
PIN_TILES = (24, 48)   # frames shown for one stretch: up to PIN_LONG s, then longer stretches
PIN_LONG = 8.0
PIN_SPAN = (2.0, 45.0)  # shortest / longest stretch looked at closely (s)
FRAME_TILES = 16       # frames shown when a change falls between two tiles
FIND_EVERY = (0.5, 4.0)  # overview spacing bounds (s)
FIND_TILES = 240
FIND_FINE = 0.25       # candidate spacing for the overview (s); picked from by how much the picture changes
FIND_TIME_SHARE = 0.35  # share of the overview spread evenly in time, so a still stretch keeps a few tiles
FIND_AREA_MAX = 320 * 180
EXPLAIN_TILES = 24
EXPLAIN_LONG = 10.0    # longest stretch shown to explain one moment (s)
MAX_STEPS = 6
WINDOW_MAX = 3.0       # longest frame-by-frame stretch (s)
TILE_AREA = {"find": 160 * 90, "pin": 256 * 144, "explain": 320 * 180}

KIND = LangDict({"reveal": "揭秘 / 变化时刻", "twist": "反转时刻", "climax": "高潮时刻", "goof": "穿帮时刻"},
                en={"reveal": "reveal / change", "twist": "twist", "climax": "climax", "goof": "goof"})
KIND_CRITERIA = {
    "reveal": "揭秘 / 变化：东西出现、消失、变成别的（魔术的变化瞬间、开箱、前后对比）",
    "twist": "反转：剧情或说法突然翻转，结果和观众以为的不一样",
    "climax": "高潮：情绪或节奏最高的地方（爆笑、尖叫、音乐炸开、比赛决胜、动作最猛）",
    "goof": "穿帮：不该被看到的被看到了（魔术露馅、道具 / 工作人员 / 收音设备入镜、前后镜头不连贯、台词口误）",
}
ROLE = LangDict({"setup": "初始状态", "method": "手法 / 关键动作", "reveal": "变化瞬间", "reaction": "反应"},
                en={"setup": "setup", "method": "method / key move", "reveal": "the change", "reaction": "reaction"})
ROLES = ("setup", "method", "reveal", "reaction")
ROLE_CRITERIA = {
    "setup": "初始状态：观众被告知 / 看到的“正常”样子（空碗、空手、选好的牌），关键动作开始前最后一个看得清的帧",
    "method": "手法 / 关键动作：变化真正发生的那个动作（遮挡、换手、甩手、扑向镜头、镜头被挡、剪辑点），写一格或一段 \"07-09\"",
    "reveal": "变化瞬间：东西第一次出现 / 消失 / 换掉、看得清的那一格（最重要；只是一团运动模糊的不算）；常常比镜头亮出来、人惊呼早，要往前找；结果出现在两格之间就写 \"10-11\"，会逐帧再看一次",
    "reaction": "反应：人的反应最强的那一格（惊呼、大笑、凑上去看）；没有就不写",
}

REACT = re.compile(r"^[\s，。,.!！?？]*(诶|欸|哎|哇|啊|噢|哦|呀|我[靠操去天]|卧槽|握草|天[哪呐啊]|妈呀|什么)|"
                   r"卧槽|我靠|我操|我去|天哪|天呐|怎么(变|做|弄|回事|可能|来的|过去)|哪来的|不可能|牛逼|牛啊|太牛|绝了|厉害|神了|离谱|"
                   r"\b(wow|whoa|what|no way|oh my|holy|how did)\b", re.I)
MAGIC = re.compile(r"魔术|变魔术|魔术师|扑克|纸牌|硬币|三仙归洞|近景魔术|障眼法|\bmagic(ian)?\b|card trick", re.I)
LOUD_DB, HIGH_ST = 4.0, 2.0

FIND_INSTRUCTIONS = """你是短视频剪辑师，在找这条视频里值得单独剪出来的「特殊时刻」：<FOCUS>
材料：state.lines 是语音识别的台词（时间 说话人 文本 [语气]，未校对，同音错字常见），state.screen_text 是画面上读到的字幕 / 花字（时间 文字，有字幕时比台词可靠）；图是整片按时间排开的小格总览，格子左上角是秒数；
格子太小看不清时用 state.zoom_cmd 抽一段大图看（把 {start} {end} {every} 换成秒数、{name} 换成一个文件名；段长时 every 写大一点；东西小就加 --focus 只放大那一块；输出可能分成 _1、_2…，以命令打印的 tiles 列表为准；写在 look/zoom/ 里没关系）；
能直接看视频的（比如 Gemini）：可以直接看 state.video（带声音），比小格准，时间用整片的秒数写；
state.hints 是工具从声音和画面里测到的候选（有人惊呼、人声突然变大、快速动作后突然定住），大约只有一成是真的，只用来提醒你去看哪里。
先通读台词弄清这条视频在演什么（谁要变什么、剧情走到哪），再对着总览找画面上发生变化的地方。

按 JEV 格式回答，只回 JSON：{"moments": ["开始秒-结束秒 类型 概率 一句话：发生了什么", ...]}
- 类型从 kinds 里选；例如 "62.0-70.0 reveal .9 空手变出核桃，出现在左边碗里"。
- 一段从变化前的准备（初始状态）到人的反应结束，通常 3-15 秒；一段只放一次变化：同一个魔术先后变了两次（先出牌、再变花）就写成两段，按时间排。
- 画面里播放的别的视频（回放、录屏里的节目）不算，除非这条视频就是在讲它。
- 总览格子太稀看不清就把段落放宽一点，下一步会逐帧细看。没有特殊时刻就回 {"moments": []}。最多 <MAX> 段，挑最精彩的。"""
PIN_INSTRUCTIONS = """你是短视频剪辑师，在定每个特殊时刻的关键帧。图里每一块是一段（标题写着段编号、类型和时间），格子左上角是格子编号（时间在 state 里）。
state.what 是上一步对这一段的描述，state.lines 是这一段的台词，state.screen_text 是这一段画面上的字。

按 JEV 格式回答，只回 JSON：{"<段编号>": {"keep": "yes .9", "kind": "reveal", "setup": "02", "method": "05-07", "reveal": "09", "reaction": "14",
"what": "一句话：发生了什么", "how": "手法推测 / 穿帮细节，写成推测并给把握"}, ...}
- keep：这段到底是不是特殊时刻（yes / no + 概率）；no 的只写 keep。
- 关键帧从 roles 里选，写格子编号；变化发生在两格之间（前一格还没有、后一格已经有）就把 reveal 写成 "10-11"。
- 变化不在这段里（还没开始就结束了，或者在最后一格之后）：reveal 写 "before" 或 "after"，会挪一下再看。
- what / how 里提到画面写秒数，不写格子编号（报告里看不到格子）；how 只写看得见的依据（"9.4s 左手一直扣着碗"），魔术手法、穿帮都要标"推测"。
- 格子标签是 "编号 秒数"；看不清可以用 state.zoom_cmd 抽更密的大图（把 {start} {end} {every} 换成秒数、{name} 换成文件名，输出文件以命令打印的 tiles 列表为准）。"""
FRAME_INSTRUCTIONS = """你是短视频剪辑师，这一轮逐帧细看：每一块（标题写着段编号和时间）只有变化前后那一小段，格子标签是 "编号 秒数"。
只回 JSON：{"<段编号>": {"reveal": "05"}, ...}，reveal 是第一次看清结果的那一格（只是一团运动模糊的不算）；
结果在第一格就已经有了写 "00"（记在第一格），最后一格还没有写 "after"（记在最后一格；下一步讲解时可以用 * 改到真正的那一帧）。看完发现上一轮的 what / how 不对，可以在同一段里再写 what / how 改掉（写秒数）。"""
EXPLAIN_INSTRUCTIONS = """你是做魔术揭秘 / 高光解说的剪辑师，要把每个特殊时刻讲给没看懂的观众：工具会按你的回答画一张编号的连续帧图解，剪一段「原速 → 慢放放大 → 定格」的揭秘短片。
图里每一块是一段（标题写着段编号和时间），从初始状态到变化之后，格子标签是 "编号 秒数"；state 里每段有上一轮的 what / how 和关键帧 frames（秒）。

按 JEV 格式回答，只回 JSON：{"<段编号>": {"steps": ["4.0 两只空碗倒扣在地上", "5.0 右手扣住左边的碗 @.36,.72", "*5.1 指缝下面出现核桃 @.36,.73", "7.6 松手，镜头这头才看见"],
"frames": "4.83-5.37", "focus": ".15,.50,.55,.90", "what": "一句话（可不写）", "seen": "一句话", "guess": "推测：一句话", "why": "一句话"}, ...}
- steps：3-6 步，按时间排，每步 "秒数 一句话"（关键动作那几步尽量落在 frames 里，比如"指尖捏着核桃靠近碗""手盖住碗""碗里看清核桃"）；一句话只写画面里看得见的事，不超过 20 字。可以超出图里的时间范围（变化更早 / 更晚时）。
- 关键一步前面加 *：东西第一次看得清地出现 / 消失 / 换掉的那一帧（短片会定格在这一帧，一团运动模糊的不行，往后挪到第一帧清楚的）。变化常常比镜头亮出来、人惊呼早，要往前找（手盖住、挡住、换手、镜头晃开的时候）；更早那帧只是模糊的一团，可以作为前一步写进去。格子看不清就用 state.zoom_cmd 抽密的大图逐帧看，秒数写到 0.1 以内。
- 先核对上一轮的 what / 关键帧：逐帧放大看过后发现不对（比如东西其实还在手上），以你这一轮看到的为准，what 和 steps 都按新的写。
- 东西小（几十个像素）时，zoom_cmd 加 --focus x0,y0,x1,y1 只放大那一块再逐帧看（--grid 和 --focus 一起用时，网格是这一块里的坐标，@x,y 要换算回整幅画面）。
- 能直接看视频的（比如 Gemini）：先看 state.video 的这一段（带声音）找变化，再用逐帧图定到帧。
- frames：变化的连续过程 "开始秒-结束秒"：从关键动作开始（手捏着东西靠近、盖住、挡住）到东西完全看清，通常 0.2-1.5 秒。必须逐帧找：用 state.zoom_cmd 把 every 写成 0.033（每一帧）看这一段，写到 0.01 秒。图解会把这段每一帧放大排成一行，短片慢放的也是这一段——观众要看到东西是怎么一点点过去的，不是突然冒出来。
- @x,y：这一步该看的东西在整幅画面里的位置（0-1，左上角 0,0；整幅画面包括上下的模板、横幅）。先用 state.grid_cmd 抽这一步那一帧的带网格大图（把 {t} 换成这一步的秒数、{t_end} 换成秒数 +0.01），在图上量，圈在那个东西本身上（不是几个东西中间的空隙）；只在看得清、确定的时候写，宁缺毋错（画错圈比不画更糟）。圈只在这一步的那一帧附近出现；圈必须在 focus 框里面，框外的圈不画。
- 每一步默认按 focus 放大；要看整个画面的一步（比如另一个人的反应）在句末写 "@全"。
- focus：放大区域 "x0,y0,x1,y1"（0-1，整幅画面坐标），图解和短片都按它放大，框越小放越大；框住手和道具、去掉模板和横幅；整个画面都要看就不写。框的宽高比会被限制在 0.6-1.8（太扁太窄会往外扩），短片里放大的画面按原比例加黑边。
- what：一句话重写这一段发生了什么（必写，图解标题用它；里面提到的秒数要和关键一步一致，或者干脆不写秒数）。
- seen：画面里看得到的证据（写秒数）。guess：画面里看不到、靠推测的部分（手法、道具从哪来），以"推测："开头；没有就不写。why：观众为什么没发现（注意力被引到哪了）；不是魔术可以不写。"""
FOCUS = {"magic": "这是魔术视频：每段魔术的变化瞬间（东西出现、消失、换了），以及露馅 / 穿帮的地方。",
         "drama": "这是剧情视频：反转、情绪高潮，以及穿帮（道具、工作人员、前后不连贯）。",
         "": "精彩的高光时刻：变化 / 揭秘、反转、高潮，以及穿帮。"}


# ------------------------------------------------------------------ hints (sound + picture) --------------------------

def reactions(lines: list[dict]) -> list[dict]:
    """Lines that sound like a reaction, with a 0-1 strength and why."""
    out = []
    for ln in lines or []:
        text = str(ln.get("text") or "")
        why, s = [], 0.0
        if REACT.search(text):
            s += 0.5
            why.append(T("台词「{x}」", "line “{x}”", x=text[:16]))
        emo = ln.get("emotion")
        if emo == "surprised":
            s += 0.4
            why.append(T("语气惊讶", "surprised voice"))
        elif emo == "happy":
            s += 0.15
            why.append(T("语气开心", "happy voice"))
        ev = ln.get("event")
        if ev in ("laughter", "applause", "cry"):
            s += 0.4
            why.append({"laughter": T("笑声", "laughter"), "applause": T("掌声", "applause"), "cry": T("哭声", "crying")}[ev])
        pr = ln.get("prosody") or {}
        if (pr.get("level_rel") or 0) >= LOUD_DB or (pr.get("pitch_rel_st") or 0) >= HIGH_ST:
            s += 0.25
            why.append(T("比平时大声 / 调高", "louder / higher than usual"))
        if s > 0:
            out.append({"t": float(ln["start"]), "score": min(1.0, s), "why": why})
    return out


def vocal_bursts(vocals: Path | None, dur: float) -> list[dict]:
    """Short bursts in the vocal stem, 6 dB and more over its last ten seconds: a shout or a laugh the recognizer
    often drops."""
    if not vocals or not Path(vocals).is_file():
        return []
    from .media import extract_audio

    x = extract_audio(vocals, 16000)
    if x is None or not len(x):
        return []
    hop = int(16000 * STEP)
    k = len(x) // hop
    db = 20 * np.log10(np.sqrt((x[:k * hop].reshape(k, hop) ** 2).mean(1) + 1e-10))
    w = int(10 / STEP)
    out = []
    for i in range(k):
        ref = float(np.median(db[max(0, i - w):i + 1]))
        jump = db[i] - ref - 6
        if jump > 0 and db[i] > -45 and (i == 0 or db[i] >= db[i - 1]) and (i + 1 >= k or db[i] >= db[i + 1]):
            out.append({"t": i * STEP, "score": min(1.0, jump / 20), "why": [T("人声突然变大", "voice jumps up")]})
    return out


def holds(track) -> list[dict]:
    """A fast move that stops dead: the picture's busiest part moves hard, then holds (a pose held to show a result)."""
    if track is None or not track.n:
        return []
    import cv2

    B = np.stack([cv2.resize(t, (12, 8), interpolation=cv2.INTER_AREA) for t in track.thumbs]).astype(np.float32)
    d = np.zeros(len(B))
    d[1:] = np.abs(B[1:] - B[:-1]).max(axis=(1, 2))
    ts = np.asarray(track.times, dtype=float) if track.times is not None and len(track.times) else np.arange(track.n) / track.fps
    idx = np.clip((ts / STEP).astype(int), 0, None)
    n = int(idx.max()) + 1
    cnt = np.bincount(idx, minlength=n)
    m = np.bincount(idx, weights=d, minlength=n) / np.maximum(cnt, 1)
    r = np.argsort(np.argsort(m)) / max(1, n - 1)  # rank: a busy video and a calm one alike
    out = []
    for i in range(1, n - 4):
        s = float(r[max(0, i - 4):i + 1].max() * (1 - r[i + 1:i + 5].mean()))
        if s >= 0.7:
            out.append({"t": (i + 1) * STEP, "score": s - 0.5, "why": [T("快速动作后定住", "a fast move stops dead")]})
    return out


def hints(lines: list[dict], vocals: Path | None, track, dur: float, top: int | None = None) -> list[dict]:
    """The tool's candidate times (where something may happen; for the reader to check), in time order; about one
    per 20 s of video, TOP_HINTS at least."""
    top = top or max(TOP_HINTS, int(dur / 20))
    pts: list[dict] = []
    for r in reactions(lines):  # a reaction comes after its cause: point a little before it
        pts.append({"t": max(0.0, r["t"] - 1.0), "score": r["score"], "why": r["why"]})
    for v in vocal_bursts(vocals, dur):
        pts.append({"t": max(0.0, v["t"] - 1.0), "score": 0.5 * v["score"], "why": v["why"]})
    for h in holds(track):
        pts.append({"t": h["t"], "score": 0.5 * h["score"], "why": h["why"]})
    pts.sort(key=lambda p: p["t"])
    merged: list[dict] = []
    for p in pts:  # within 1.5 s: one hint, the signals add up
        if merged and p["t"] - merged[-1]["t"] <= 1.5:
            m = merged[-1]
            m["score"] = min(1.0, m["score"] + p["score"])
            m["why"] += [w for w in p["why"] if w not in m["why"]]
        else:
            merged.append({**p, "why": list(p["why"])})
    best = sorted(merged, key=lambda p: -p["score"])[:top]
    return [{"t": round(float(p["t"]), 2), "score": round(float(p["score"]), 2), "why": p["why"][:3]} for p in sorted(best, key=lambda p: p["t"])]


def genre(b: dict) -> str:
    """"magic" when the title, the words or the VLM say so; "drama" for a story; else ""."""
    src = b.get("source") or {}
    meta = b.get("platform_meta") or {}
    w = b.get("whole_video_vlm") or {}
    title = " ".join(str(x) for x in (src.get("filename"), meta.get("title"), meta.get("desc")) if x)
    said = " ".join(str(ln.get("text") or "") for ln in (b.get("speech") or {}).get("lines") or [])
    seen = " ".join(str(w.get(k) or "") for k in ("summary", "format"))
    if MAGIC.search(title) or MAGIC.search(seen) or len(MAGIC.findall(said)) >= 2:
        return "magic"
    if "剧情" in str(w.get("format") or "") or re.search(r"短剧|剧情|drama", title, re.I):
        return "drama"
    return ""


# ------------------------------------------------------------------ answers ----------------------------------------

_P = re.compile(r"^(?:0?\.\d+|1(?:\.0+)?)$")


def _secs(s: str) -> float | None:
    from .vlm import _sec

    return _sec(s)


def parse_found(ans: dict, dur: float) -> list[dict]:
    """{"moments": ["62.0-70.0 reveal .9 what", {...}]} -> [{"t0", "t1", "kind", "p", "what"}]."""
    out = []
    for m in (ans or {}).get("moments") or []:
        if isinstance(m, dict):
            t0, t1 = _secs(m.get("t0", m.get("start"))), _secs(m.get("t1", m.get("end")))
            kind, p, what = str(m.get("kind") or ""), m.get("p", 0.8), str(m.get("what") or "")
        elif isinstance(m, str):
            parts = m.strip().split(None, 3)
            if not parts or "-" not in parts[0].lstrip("-"):
                continue
            a, _, z = parts[0].partition("-")
            t0, t1 = _secs(a), _secs(z)
            kind = parts[1] if len(parts) > 1 else ""
            rest = parts[2:]
            p = 0.8
            if rest and _P.match(rest[0]):
                p = float(rest[0])
                rest = rest[1:]
            what = " ".join(rest)
        else:
            continue
        if t0 is None or t1 is None or kind not in KIND_CRITERIA:
            continue
        t0, t1 = max(0.0, min(t0, t1)), min(dur, max(t0, t1))
        try:
            p = float(p)
        except (TypeError, ValueError):
            p = 0.8
        if t1 - t0 >= 0.3:
            out.append({"t0": round(t0, 2), "t1": round(t1, 2), "kind": kind, "p": round(p, 2), "what": what.strip()[:120]})
    return sorted(out, key=lambda m: m["t0"])[:MAX_MOMENTS]


def _tile(v, n: int) -> tuple[int, int] | str | None:
    """"07" -> (7, 7); "07-09" -> (7, 9); "before" / "after"; anything else None."""
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        v = str(int(v))
    if not isinstance(v, str):
        return None
    v = v.strip().split()[0] if v.strip() else ""
    if v in ("before", "after"):
        return v
    a, _, z = v.partition("-")
    try:
        i, j = int(a), int(z) if z else int(a)
    except ValueError:
        return None
    if not (0 <= i < n and 0 <= j < n):
        return None
    return (min(i, j), max(i, j))


def _yes(v) -> tuple[bool, float]:
    if isinstance(v, bool):
        return v, 1.0
    s = str(v or "yes").strip().split()
    p = float(s[1]) if len(s) > 1 and _P.match(s[1]) else 0.9
    return s[0].lower() not in ("no", "false", "否"), p


# ------------------------------------------------------------------ sheets -----------------------------------------

def _tile_w(info, look: str, area: float | None = None) -> int:
    import math

    aspect = info.width / info.height if info.width and info.height else 16 / 9
    return max(40, int(round(math.sqrt((area or TILE_AREA[look]) * aspect))))


def _thumbs(video: str, step: float) -> np.ndarray | None:
    """16x16 RGB thumbnails every `step` s, one decode pass; None when ffmpeg fails."""
    import subprocess

    r = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-an", "-vf", f"fps=1/{step:.4f},scale=16:16:flags=area",
                        "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True)
    if r.returncode != 0 or not r.stdout:
        return None
    a = np.frombuffer(r.stdout, dtype=np.uint8)
    n = a.size // (16 * 16 * 3)
    return a[: n * 768].reshape(n, 768).astype(np.float32) if n else None


def overview_times(video: str, dur: float, n: int) -> list[float]:
    """n overview times picked by picture change: dense where things move, sparse where nothing does (near-duplicate
    frames merge), with FIND_TIME_SHARE spread by time; uniform when the thumbnails can't be read."""
    uniform = [round(float(t), 2) for t in np.linspace(0.0, max(dur - 0.05, 0.0), n)]
    step = max(FIND_FINE, dur / (n * 8))
    th = _thumbs(video, step)
    if th is None or len(th) < 3 or len(th) <= n:
        return uniform if th is None or len(th) < 3 else [round(i * step, 2) for i in range(len(th)) if i * step < dur]
    diff = np.r_[0.0, np.abs(np.diff(th, axis=0)).mean(axis=1)]
    total = float(diff.sum())
    if total <= 1e-6:
        return uniform
    c = np.cumsum(diff * (1 - FIND_TIME_SHARE) / total + FIND_TIME_SHARE / len(diff))
    idx = np.unique(np.searchsorted(c, np.linspace(c[0], c[-1], n)).clip(0, len(th) - 1))
    return [round(float(i * step), 2) for i in idx if i * step < dur]


def _blocks_sheets(video: str, info, blocks: list[tuple[str, list[float], list[str]]], look: str, out: Path, stem: str,
                   area: float | None = None) -> list[str]:
    """Titled rows of tiles packed onto as few sheets as the reader takes in unshrunk; -> sheet paths (relative)."""
    from .survey import _cols, _grab, _grid, _pack, _sheet

    tw = _tile_w(info, look, area)
    ims = []
    for title, times, labels in blocks:
        grid = _grid(_grab(video, info, times, width=tw), labels, [0.0] * len(times), [False] * len(times),
                     cols=_cols(tw, len(times)), tile_w=tw)
        ims.append((title, grid))
    paths = []
    for p, rows in enumerate(_pack([im for _, im in ims]), start=1):
        rel = f"moments/look/{stem}_{p:02d}.jpg"
        _sheet([[ims[k] for k in r] for r in rows], out / rel)
        paths.append(rel)
    return paths


def _lines_text(lines: list[dict], t0: float = 0.0, t1: float = 1e9) -> list[str]:
    from .prosody import EMOTION

    out = []
    for ln in lines or []:
        if t0 <= float(ln.get("start", 0)) <= t1:
            tag = EMOTION.get(ln.get("emotion") or "", "") or ""
            ev = ln.get("event") or ""
            extra = " [" + "/".join(x for x in (tag, ev) if x) + "]" if (tag or ev) else ""
            out.append(f"{float(ln['start']):.1f} {ln.get('speaker') or ''} {str(ln.get('text') or '')[:60]}{extra}".replace("  ", " "))
    return out


def _screen_text(b: dict, t0: float = 0.0, t1: float = 1e9, cap: int = 300) -> list[str]:
    """Text read off the frames (subtitles, 花字, labels), once each: often says what happens ("凭空出现！")."""
    out, seen = [], set()
    for c in (b.get("packaging") or {}).get("text_cues") or []:
        t, x = c.get("t0"), str(c.get("text") or "").strip()
        if t is None or not x or x in seen or not (t0 <= float(t) <= t1) or c.get("kind") == "scene":
            continue
        seen.add(x)
        out.append(f"{float(t):.1f} {x[:40]}")
    if len(out) > cap:  # spread over the whole video, not its first minutes
        out = [out[int(i)] for i in np.linspace(0, len(out) - 1, cap).round()]
    return out


def _zoom_cmd(video: str, out: Path) -> str:
    return (f"rea-video tiles '{video}' --start {{start}} --end {{end}} --every {{every}} --cell 320 [--focus x0,y0,x1,y1 --cell 480] "
            f"-o '{out / 'moments' / 'look' / 'zoom' / '{name}.jpg'}'")


def _grid_cmd(video: str, out: Path) -> str:
    return f"rea-video tiles '{video}' --start {{t}} --end {{t_end}} --every 1 --cols 1 --cell 960 --grid -o '{out / 'moments' / 'look' / 'zoom' / 'grid_{{t}}.jpg'}'"


def find_task(b: dict, out: Path, info) -> dict:
    video, dur = b["source"]["path"], float(b["source"]["duration"])
    every = min(FIND_EVERY[1], max(FIND_EVERY[0], dur / FIND_TILES))
    n = min(FIND_TILES, max(12, int(dur / every)))
    times = overview_times(video, dur, n)
    area = min(FIND_AREA_MAX, TILE_AREA["find"] * FIND_TILES / max(1, len(times)) * 0.5) if len(times) < FIND_TILES else None
    area = max(area, TILE_AREA["find"]) if area else None
    from .survey import _cols

    tw = _tile_w(info, "find", area)
    per_row = _cols(tw, len(times))
    blocks = []
    for k in range(0, len(times), per_row):
        row = times[k:k + per_row]
        blocks.append((f"{fmt_time(row[0])} – {fmt_time(row[-1])}", row, [f"{t:.1f}" for t in row]))
    images = _blocks_sheets(video, info, blocks, "find", out, "find", area=area)
    g = (b.get("moments") or {}).get("genre", "")
    w = b.get("whole_video_vlm") or {}
    state = {"video": video, "zoom_cmd": _zoom_cmd(video, out), "duration": round(dur, 2), "genre": g or None, "lines": _lines_text((b.get("speech") or {}).get("lines")),
             "screen_text": _screen_text(b),
             "hints": [f"{h['t']:.1f} {'、'.join(h['why'])}" for h in (b.get("moments") or {}).get("hints") or []],
             **({"summary": w["summary"]} if w.get("summary") else {}),
             "overview": "格子按画面变化抽：动得多的地方密、静止的地方稀（几乎一样的帧合并了），左上角是秒数"}
    instr = FIND_INSTRUCTIONS.replace("<FOCUS>", FOCUS.get(g, FOCUS[""])).replace("<MAX>", str(MAX_MOMENTS))
    return {"id": "find", "images": images, "instructions": instr, "state": state,
            "questions": {"moments": {"type": "list", "kinds": KIND_CRITERIA}}, "answer_template": {"filled": True, "moments": []}}


def _pin_times(t0: float, t1: float, fps: float, n: int) -> list[float]:
    step = max(1.0 / max(fps, 1.0), (t1 - t0) / max(1, n - 1))
    return [round(float(t), 3) for t in np.arange(t0, t1 + 1e-6, step)][:n]


def pin_task(b: dict, out: Path, info, found: list[dict], rnd: int, spans: dict[str, tuple[float, float]] | None = None,
             dense: bool = False) -> dict:
    """One look at several stretches; spans overrides a stretch's range (a moved or a frame-by-frame look)."""
    video, dur = b["source"]["path"], float(b["source"]["duration"])
    fps = float(b["source"].get("fps") or 30)
    lines = (b.get("speech") or {}).get("lines")
    blocks, state = [], {}
    for m in found:
        t0, t1 = (spans or {}).get(m["id"], (m["t0"], m["t1"]))
        if not dense:  # the reader's range as given; a very short one widened, a very long one kept to its middle
            mid, half = (t0 + t1) / 2, max(PIN_SPAN[0], min(PIN_SPAN[1], t1 - t0)) / 2
            t0, t1 = max(0.0, mid - half), min(dur, mid + half)
        times = _pin_times(t0, t1, fps, FRAME_TILES if dense else PIN_TILES[0] if t1 - t0 <= PIN_LONG else PIN_TILES[1])
        blocks.append((f"{m['id']} {m['kind']}  {fmt_time(t0)} – {fmt_time(t1)}", times, [f"{j:02d} {t:.2f}" for j, t in enumerate(times)]))
        state[m["id"]] = {"kind": m["kind"], "what": m.get("what", ""), "times": times,
                          "lines": _lines_text(lines, t0 - 1.0, t1 + 1.0), "screen_text": _screen_text(b, t0 - 1.0, t1 + 1.0, cap=20)}
    images = _blocks_sheets(video, info, blocks, "pin", out, f"pin_r{rnd}")
    if dense:
        return {"id": f"pin_r{rnd}", "images": images, "instructions": FRAME_INSTRUCTIONS, "state": state,
                "questions": {"per": "stretch", "reveal": ROLE_CRITERIA["reveal"]},
                "answer_template": {"filled": True, **{m["id"]: {"reveal": ""} for m in found}}}
    return {"id": f"pin_r{rnd}", "images": images, "instructions": PIN_INSTRUCTIONS,
            "state": {"video": video, "zoom_cmd": _zoom_cmd(video, out), **state},
            "questions": {"per": "stretch", "roles": ROLE_CRITERIA, "kinds": KIND_CRITERIA},
            "answer_template": {"filled": True, **{m["id"]: {} for m in found}}}


def explain_task(b: dict, out: Path, info, items: list[dict]) -> dict:
    """Each moment from setup to just after the change, closer than the pin look, for the steps."""
    video, dur = b["source"]["path"], float(b["source"]["duration"])
    fps = float(b["source"].get("fps") or 30)
    lines = (b.get("speech") or {}).get("lines")
    blocks, state = [], {}
    for it in items:
        fr = it["frames"]
        t1 = min(dur, max(it["t"] + 0.8, fr.get("reaction", 0.0)))
        t0 = max(0.0, min(fr.values()) - 0.5, t1 - EXPLAIN_LONG)
        times = _pin_times(t0, t1, fps, EXPLAIN_TILES)
        blocks.append((f"{it['id']} {it['kind']}  {fmt_time(t0)} – {fmt_time(t1)}", times, [f"{j:02d} {t:.2f}" for j, t in enumerate(times)]))
        state[it["id"]] = {"kind": it["kind"], "what": it.get("what", ""), "how": it.get("how", ""),
                           "frames": {r: fr[r] for r in ROLES if r in fr}, "times": times,
                           "lines": _lines_text(lines, t0 - 1.0, t1 + 1.0), "screen_text": _screen_text(b, t0 - 1.0, t1 + 1.0, cap=20)}
    images = _blocks_sheets(video, info, blocks, "explain", out, "explain")
    return {"id": "explain", "images": images, "instructions": EXPLAIN_INSTRUCTIONS,
            "state": {"video": video, "zoom_cmd": _zoom_cmd(video, out), "grid_cmd": _grid_cmd(video, out), **state},
            "questions": {"per": "moment", "fields": ["steps", "frames", "focus", "what", "seen", "guess", "why"]},
            "answer_template": {"filled": True, **{it["id"]: {"steps": [], "frames": "", "focus": "", "what": "", "seen": "", "guess": "", "why": ""}
                                                for it in items}}}


_STEP = re.compile(r"^\s*(\*)?\s*(\d+(?::\d+)?(?:\.\d+)?)\s*s?\s+(.+?)\s*(?:@\s*([01]?\.\d+|[01])\s*[,，]\s*([01]?\.\d+|[01]))?\s*$")


def _frac(v) -> float | None:
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    return x if 0.0 <= x <= 1.0 else None


def parse_steps(v, dur: float) -> list[dict]:
    """["*5.1 指缝下面出现核桃 @.36,.73", ...] or dicts -> [{t, text, key?, at?}] in time order; one key step at most."""
    out = []
    for s in v if isinstance(v, list) else []:
        if isinstance(s, dict):
            t = _secs(str(s.get("t", "")))
            text, key = str(s.get("text") or "").strip(), bool(s.get("key"))
            at = s.get("at") if isinstance(s.get("at"), (list, tuple)) and len(s.get("at")) == 2 else None
            at = (_frac(at[0]), _frac(at[1])) if at else None
        else:
            raw = str(s)
            whole = bool(re.search(r"\s*@\s*(全|full)\s*$", raw, re.I))
            m = _STEP.match(re.sub(r"\s*@\s*(全|full)\s*$", "", raw, flags=re.I))
            if not m:
                continue
            t, text, key = _secs(m.group(2)), m.group(3).strip(), bool(m.group(1))
            at = (_frac(m.group(4)), _frac(m.group(5))) if m.group(4) else None
        if t is None or not text or not (0.0 <= t <= dur):
            continue
        st = {"t": round(float(t), 2), "text": text[:40]}
        if (s.get("whole") if isinstance(s, dict) else whole):
            st["whole"] = True
        if key:
            st["key"] = True
        if at and None not in at:
            st["at"] = [round(at[0], 3), round(at[1], 3)]
        out.append(st)
    out.sort(key=lambda x: x["t"])
    keys = [s for s in out if s.get("key")]
    for s in keys[1:]:
        s.pop("key")
    if len(out) > MAX_STEPS:
        rest = [s for s in out if not s.get("key")][:MAX_STEPS - len(keys[:1])]
        out = sorted(rest + keys[:1], key=lambda x: x["t"])
    return out


def _box(v) -> list[float] | None:
    xs = [_frac(x) for x in re.split(r"[\s,，]+", str(v).strip())] if v else []
    if len(xs) != 4 or None in xs or xs[2] - xs[0] < 0.05 or xs[3] - xs[1] < 0.05:
        return None
    return [round(x, 3) for x in xs]


def _window(v, dur: float) -> list[float] | None:
    """"4.83-5.37" -> [4.83, 5.37]: the change frame by frame, at most WINDOW_MAX s."""
    m = re.match(r"^\s*([\d:.]+)\s*[-–~]\s*([\d:.]+)\s*s?\s*$", str(v or ""))
    if not m:
        return None
    a, z = _secs(m.group(1)), _secs(m.group(2))
    if a is None or z is None or not (0.0 <= a < z <= dur) or z - a > WINDOW_MAX:
        return None
    return [round(a, 3), round(z, 3)]


def apply_explain(it: dict, a: dict, dur: float) -> None:
    """The reader's steps onto a moment; a key step moves the change to it (a closer look than the pin rounds)."""
    steps = parse_steps((a or {}).get("steps"), dur)
    if not steps:
        return
    ex = {"steps": steps}
    if _box(a.get("focus")):
        ex["focus"] = _box(a.get("focus"))
    win = _window(a.get("frames"), dur)
    if win:
        ex["frames"] = win
    for k in ("seen", "guess", "why"):
        if str(a.get(k) or "").strip():
            ex[k] = str(a[k]).strip()[:120]
    if str(a.get("what") or "").strip():
        it["what"] = str(a["what"]).strip()[:200]
    it["explain"] = ex
    key = next((s for s in steps if s.get("key")), None)
    if key:
        fr = it["frames"]
        it["t"] = fr["reveal"] = key["t"]
        before = [s["t"] for s in steps if s["t"] < key["t"]]
        if fr.get("method", 0) >= key["t"]:
            fr.pop("method")
            if len(before) >= 2:
                fr["method"] = before[-1]
        if fr.get("setup", 0) >= fr.get("method", key["t"]):
            fr["setup"] = before[0] if before else round(max(0.0, key["t"] - 2.0), 3)
        if fr.get("reaction", 1e9) <= key["t"]:
            fr.pop("reaction")
        if it.get("method_span") and it["method_span"][0] >= key["t"]:
            it.pop("method_span")
    ts = [s["t"] for s in steps]
    it["span"] = [round(max(0.0, min(it["span"][0], min(ts) - 1.0)), 2), round(min(dur, max(it["span"][1], max(ts) + 1.5)), 2)]


# ------------------------------------------------------------------ the loop ---------------------------------------

def _paths(out: Path, tid: str) -> tuple[Path, Path]:
    d = out / "moments" / "look"
    return d / f"{tid}.task.json", d / f"{tid}.answer.json"


def _answer(out: Path, tid: str) -> dict | None:
    _, ap = _paths(out, tid)
    if not ap.is_file():
        return None
    try:
        a = read_json(ap)
    except (ValueError, OSError):
        return None
    return a if isinstance(a, dict) and a.get("filled") else None


def _put(out: Path, task: dict) -> None:
    tp, ap = _paths(out, task["id"])
    write_json(tp, task)
    if not ap.is_file():
        write_json(ap, {**task["answer_template"], "filled": False})


VIDEO_NOTE = ("另外附了视频（带声音），按顺序是：{list}。变化以视频为准（看连续的动作、听声音），"
              "图里的格子用来对时间、写格子编号；视频里的时间从片段开头算，要换算成整片的秒数（加上片段开始秒数）。")
CLIP_PAD = 0.5


def _wants_video(client) -> bool:
    """Gemini takes video; an OpenAI-compatible VLM does unless REA_VLM_MEDIA=frames."""
    if getattr(client, "video_ok", False):
        return True
    cfg = getattr(client, "cfg", None)
    return bool(cfg) and getattr(cfg, "media", "both") != "frames"


def _task_clips(task: dict, clip_dir: Path) -> list[tuple[Path, str]]:
    """Clips with sound for a task: the whole video (low res) for the overview, each stretch for a closer look."""
    from .media import cut_clip, video_info

    st = task.get("state") or {}
    video = st.get("video")
    if not video or not Path(video).is_file():
        return []
    clip_dir.mkdir(parents=True, exist_ok=True)
    if task["id"] == "find":
        p = clip_dir / "whole_480p.mp4"
        if not p.is_file():
            cut_clip(video, 0.0, video_info(video).duration, p, width=480, audio=True, crf=30)
        return [(p, "整片 0 秒起")]
    out = []
    for mid, s in st.items():
        if isinstance(s, dict) and s.get("times"):
            a, z = max(0.0, s["times"][0] - CLIP_PAD), s["times"][-1] + CLIP_PAD
            p = clip_dir / f"{task['id']}_{mid}_{a:.2f}-{z:.2f}.mp4"
            if not p.is_file():
                cut_clip(video, a, z - a, p, width=640, audio=True, crf=24)
            out.append((p, f"{mid} 从 {a:.2f} 秒起"))
    return out


def vlm_asker(client, lang_note: str = ""):
    def ask(task: dict, images: list[Path]) -> dict:
        q = {k: task[k] for k in ("state", "questions")}
        prompt = (f"{task['instructions']}\n\n{lang_note}\n请求：\n{json.dumps(q, ensure_ascii=False)}\n\n"
                  f"只输出 JSON，形如 {json.dumps(task['answer_template'], ensure_ascii=False)}。")
        media = [(p, "image/jpeg") for p in images]
        clips = []
        if _wants_video(client) and images:
            try:
                clips = _task_clips(task, Path(images[0]).parent / "clips")
            except Exception as exc:  # noqa: BLE001  the images alone still answer
                LOG.warning("special moments: no clip for %s (%s)", task["id"], str(exc)[:80])
        if clips:
            note = VIDEO_NOTE.format(list="；".join(f"视频 {k} = {lbl}" for k, (_, lbl) in enumerate(clips, start=1)))
            try:
                got = client.ask_json(prompt + "\n\n" + note, [(p, "video/mp4") for p, _ in clips] + media, max_tokens=3000)
                if isinstance(got, dict) and got:
                    return got
            except Exception as exc:  # noqa: BLE001  a reader that refuses video: ask again with the images
                LOG.warning("special moments: the reader refused the clips (%s); images only", str(exc)[:80])
        got = client.ask_json(prompt, media, max_tokens=3000)
        return got if isinstance(got, dict) else {}
    return ask


def run(b: dict, out: Path, asker=None) -> dict:
    """Advance the look as far as the answers allow. With `asker` (a VLM) each task is answered at once; without it
    the waiting answer files are returned for an agent to fill, then this runs again.
    -> {"status": "done" | "waiting", ...}; when done, b["moments"]["items"] holds the moments."""
    from .media import video_info

    out = Path(out)
    video = b["source"]["path"]
    info = video_info(video)
    dur = float(b["source"]["duration"])
    mo = b.setdefault("moments", {})
    meta_p = out / "moments" / "look" / "look.json"
    meta = read_json(meta_p) if meta_p.is_file() else {}
    src = {"sha256_head": b["source"].get("sha256_head"), "version": VERSION}
    if meta.get("source") != src:
        for p in (out / "moments" / "look").glob("*") if (out / "moments" / "look").is_dir() else []:
            p.unlink()
        meta = {"source": src, "rounds": []}

    def step(task: dict) -> dict | None:
        if not _paths(out, task["id"])[0].is_file():
            _put(out, task)
        got = _answer(out, task["id"])
        if got is None and asker is not None:
            got = {"filled": True, "by": "vlm", **(asker(task, [out / im for im in task["images"]]) or {})}
            write_json(_paths(out, task["id"])[1], got)
        return got

    def waiting(task: dict) -> dict:
        tp, ap = _paths(out, task["id"])
        return {"status": "waiting", "stage": task["id"], "tasks": [str(tp)], "waiting": [str(ap)],
                "images": [str(out / im) for im in task["images"]]}

    # ---- find
    tp, _ = _paths(out, "find")
    task = read_json(tp) if tp.is_file() else find_task(b, out, info)
    ans = step(task)
    if ans is None:
        write_json(meta_p, meta)
        return waiting(task)
    found = parse_found(ans, dur)
    for k, m in enumerate(found, start=1):
        m["id"] = f"M{k}"
    by = ans.get("by") or "agent"
    if not found:
        mo.update(items=[], looked_by=by, status="done")
        write_json(meta_p, meta)
        return {"status": "done", "moments": 0}

    # ---- pin: a round for every stretch, then one closer look where the change fell between tiles or outside
    state: dict[str, dict] = {m["id"]: {"m": m} for m in found}
    spans: dict[str, tuple[float, float]] = {}
    todo = [m for m in found]
    rnd = 0
    dense = False
    while todo and rnd < 3:
        rnd += 1
        tid = f"pin_r{rnd}"
        tp, _ = _paths(out, tid)
        task = read_json(tp) if tp.is_file() else pin_task(b, out, info, todo, rnd, spans, dense=dense)
        ans = step(task)
        if ans is None:
            write_json(meta_p, meta)
            return waiting(task)
        nxt, nspans, ndense = [], {}, False
        for m in todo:
            st = task["state"].get(m["id"]) or {}
            times = st.get("times") or []
            a = ans.get(m["id"]) if isinstance(ans.get(m["id"]), dict) else {}
            s = state[m["id"]]
            if not dense:
                keep, p = _yes(a.get("keep"))
                s.update(keep=keep, p=p)
                if not keep:
                    continue
                kind = str(a.get("kind") or "").split()[0] if str(a.get("kind") or "").strip() else ""
                if kind in KIND_CRITERIA:
                    s["kind"] = m["kind"] = kind
                for k in ("what", "how"):
                    if a.get(k):
                        s[k] = str(a[k]).strip()[:200]
                if s.get("what"):
                    m["what"] = s["what"]  # the next look shows the reader's latest words
                for r in ROLES:
                    v = _tile(a.get(r), len(times))
                    if isinstance(v, tuple):
                        s.setdefault("frames", {})[r] = round((times[v[0]] + times[v[1]]) / 2, 3) if r != "reveal" else times[v[1]]
                        if r == "method" and v[1] > v[0]:
                            s["method_span"] = [times[v[0]], times[v[1]]]
                    if r == "reveal":
                        if v in ("before", "after") and not s.get("moved"):  # outside the stretch: move it once
                            s["moved"] = True
                            w = times[-1] - times[0] if times else 6.0
                            c = (times[0] - w / 2) if v == "before" else (times[-1] + w / 2)
                            nspans[m["id"]] = (max(0.0, c - w / 2), min(dur, c + w / 2))
                            nxt.append(m)
                        elif isinstance(v, tuple) and v[1] > v[0] and v[1] - v[0] <= 2:
                            s["between"] = (times[v[0]], times[v[1]])
            else:
                v = _tile(a.get("reveal"), len(times))
                if isinstance(v, tuple):
                    s.setdefault("frames", {})["reveal"] = times[v[1]] if v[1] > v[0] else times[v[0]]
                elif v in ("before", "after") and times:  # every frame between two tiles: the change is at one end
                    s.setdefault("frames", {})["reveal"] = times[0] if v == "before" else times[-1]
                for k in ("what", "how"):  # a closer look may correct the last one
                    if a.get(k):
                        s[k] = str(a[k]).strip()[:200]
                s.pop("between", None)
        if not nxt and not dense:
            fine = [state[i]["m"] for i in state if state[i].get("between")]
            if fine:
                nxt, ndense = fine, True
                nspans = {m["id"]: state[m["id"]]["between"] for m in fine}
        todo, spans, dense = nxt, nspans, ndense

    items = []
    for s in state.values():
        if not s.get("keep", False) or "reveal" not in (s.get("frames") or {}):
            continue
        m, fr = s["m"], s["frames"]
        rv = fr["reveal"]
        if fr.get("method", 0) > rv:  # a range read the wrong way round: the move comes before the change
            fr.pop("method")
            s.pop("method_span", None)
        if fr.get("setup", 0) > rv:
            fr.pop("setup")
        fr.setdefault("setup", round(max(m["t0"], rv - 2.0), 3))
        fr.setdefault("method", round(max(fr["setup"], rv - 0.5), 3))
        items.append({"kind": s.get("kind") or m["kind"], "t": rv, "frames": {r: fr[r] for r in ROLES if r in fr},
                      **({"method_span": s["method_span"]} if s.get("method_span") else {}),
                      "span": [round(max(0.0, min(m["t0"], min(fr.values()) - 1.0)), 2), round(min(dur, max(m["t1"], max(fr.values()) + 1.5)), 2)],
                      "what": s.get("what") or m.get("what", ""), "how": s.get("how", ""), "p": s.get("p", m.get("p")), "by": by})
    items.sort(key=lambda x: x["t"])
    for k, it in enumerate(items, start=1):
        it["id"] = f"M{k}"

    # ---- explain: the steps, for the diagram and the reveal clip
    if items:
        tp, _ = _paths(out, "explain")
        task = read_json(tp) if tp.is_file() else explain_task(b, out, info, items)
        ans = step(task)
        if ans is None:
            write_json(meta_p, meta)
            return waiting(task)
        for it in items:
            a = ans.get(it["id"])
            if isinstance(a, dict):
                apply_explain(it, a, dur)
    mo.update(items=items, looked_by=by, status="done")
    write_json(meta_p, meta)
    return {"status": "done", "moments": len(items)}


# ------------------------------------------------------------------ export -----------------------------------------

def export(b: dict, out: Path) -> None:
    """Per moment: a clip with sound, the key frames full size and one picture (moments/M1.jpg): the numbered step
    diagram when the moment was explained, else a strip of the key frames; plus the reveal clip (moments/M1_reveal.mp4)."""
    from .media import cut_clip, extract_frame
    from . import reveal

    items = (b.get("moments") or {}).get("items") or []
    if not items:
        return
    out = Path(out)
    video = b["source"]["path"]
    if not Path(video).is_file():
        return
    d = out / "moments"
    d.mkdir(parents=True, exist_ok=True)
    w = min(1080, int(b["source"].get("width") or 1080))
    for it in items:
        files = {}
        for r, t in it["frames"].items():
            p = d / f"{it['id']}_{r}_{t:.2f}s.jpg"
            if not p.is_file():
                extract_frame(video, t, p, width=w)
            files[r] = p.name
        a, z = it["span"]
        clip = d / f"{it['id']}_{a:.1f}-{z:.1f}s.mp4"
        if not clip.is_file():
            try:
                cut_clip(video, a, min(30.0, z - a), clip, width=720, audio=bool(b["source"].get("has_audio")), crf=23)
            except Exception:  # noqa: BLE001  the frames still stand without the clip
                clip = None
        strip = d / f"{it['id']}.jpg"
        ex = it.get("explain") or {}
        rv = None
        strip.unlink(missing_ok=True)
        if ex.get("steps"):
            sw, sh = int(b["source"].get("width") or 0), int(b["source"].get("height") or 0)
            box = reveal.zoom_box(ex.get("focus"), [tuple(s["at"]) for s in ex["steps"] if s.get("at") and not s.get("whole")], sw, sh) if sw and sh else None
            if box:  # a ring outside the zoom would be drawn off the picture: drop it
                bx = (box[0] / sw, box[1] / sh, (box[0] + box[2]) / sw, (box[1] + box[3]) / sh)
                for s in ex["steps"]:
                    if s.get("at") and not s.get("whole") and not (bx[0] <= s["at"][0] <= bx[2] and bx[1] <= s["at"][1] <= bx[3]):
                        s.pop("at")
            notes = [(k, T(lbl, en) + ex[k]) for k, lbl, en in (("seen", "看得到的：", "Seen: "), ("guess", "看不到的：", "Not on screen: "),
                                                                 ("why", "为什么没发现：", "Why it's missed: ")) if ex.get(k)]
            title = f"{it['id']} · {KIND.get(it['kind'], it['kind'])}" + (f" · {it['what'][:60]}" if it.get("what") else "")
            sub = T("{a}–{b}，{z}红圈 = 该看的地方", "{a}–{b}, {z}red ring = where to look", a=fmt_time(ex["steps"][0]["t"])[:-2],
                    b=fmt_time(ex["steps"][-1]["t"])[:-2], z=T("局部放大；", "zoomed; ") if box else "")
            kt = next((s["t"] for s in ex["steps"] if s.get("key")), None)
            fps = float(b["source"].get("fps") or 30)
            win = ex.get("frames") or ([max(0.0, kt - reveal.SEQ_DEFAULT[0]), kt + reveal.SEQ_DEFAULT[1]] if kt is not None else None)
            seq = reveal.seq_times(win[0], win[1], fps, kt) if win else []
            step_ms = round((seq[1] - seq[0]) * 1000) if len(seq) > 1 else 0
            seq_title = T("逐帧过程 {a:.2f}–{z:.2f}s（每格间隔约 {ms} 毫秒{k}；前后灰色格是变化前后的样子）", "Frame by frame {a:.2f}–{z:.2f}s (about {ms} ms apart{k}; grey tiles: before and after)",
                          a=win[0], z=win[1], ms=step_ms, k=T("，红框是关键一帧", ", key frame in red") if kt is not None else "") if seq else ""
            reveal.diagram(video, ex["steps"], box, title, sub, notes, strip, seq=seq, seq_title=seq_title, key=kt,
                           seq_labels=(T("前 ", "before "), T("后 ", "after ")))
            kt = kt if kt is not None else it["t"]
            rp = d / (f"{it['id']}_reveal_{kt:.2f}s" + (f"_{win[0]:.2f}-{win[1]:.2f}" if ex.get("frames") else "") + ".mp4")
            try:
                rv = rp if rp.is_file() else reveal.reveal_clip(
                    video, bool(b["source"].get("has_audio")), (sw, sh), float(b["source"]["duration"]), tuple(it["span"]), ex["steps"],
                    box, ex.get("guess", ""), rp, {"speed": T("原速", "Speed"), "slow": T("慢放 1/{n}", "Slow 1/{n}"),
                                                   "hold": T("定格 {t:.2f}s", "Hold {t:.2f}s"), "react": T("反应", "Reaction")},
                    window=tuple(ex["frames"]) if ex.get("frames") else None)
            except Exception:  # noqa: BLE001  the diagram and the plain clip still stand
                rv = None
        sl = None
        if ex.get("steps") and sw and sh:
            win_s = ex.get("frames") or ([max(0.0, kt - reveal.SEQ_DEFAULT[0]), kt + reveal.SEQ_DEFAULT[1]] if kt is not None else None)
            if win_s:
                sp = d / f"{it['id']}_slow_{win_s[0]:.2f}-{win_s[1]:.2f}.mp4"
                key_step = next((s for s in ex["steps"] if s.get("key")), None)
                try:
                    sl = sp if sp.is_file() else reveal.slow_clip(
                        video, (sw, sh), float(b["source"]["duration"]), fps, tuple(win_s), kt, box,
                        tuple(key_step["at"]) if key_step and key_step.get("at") else None, sp,
                        {"slow": T("逐帧慢放 {i}/{n}", "Frame by frame {i}/{n}"), "pre": T("慢放 · 之前", "Slow · before"),
                         "post": T("慢放 · 之后", "Slow · after"),
                         "key": key_step["text"] if key_step else ""})
                except Exception:  # noqa: BLE001
                    sl = None
        if not strip.is_file():
            _strip([(d / files[r], ROLE[r], it["frames"][r]) for r in ROLES if r in files], strip)
        it["files"] = {"frames": files, "strip": f"moments/{strip.name}", **({"clip": f"moments/{clip.name}"} if clip else {}),
                       **({"reveal": f"moments/{rv.name}"} if rv else {}), **({"slow": f"moments/{sl.name}"} if sl else {})}
        keep = set(files.values()) | {Path(x).name for x in (clip, rv, sl) if x}
        for p in d.glob(f"{it['id']}_*"):  # files of an earlier answer (other times) go
            if p.name not in keep:
                p.unlink()


def _strip(cells: list[tuple[Path, str, float]], out: Path, h: int = 360) -> None:
    from PIL import Image, ImageDraw

    from .visual import _font

    ims = []
    font = _font(20)
    for p, label, t in cells:
        try:
            im = Image.open(p).convert("RGB")
        except OSError:
            continue
        im = im.resize((max(1, int(im.width * h / im.height)), h))
        dr = ImageDraw.Draw(im)
        text = f"{label} {t:.1f}s"
        dr.rectangle([0, 0, int(dr.textlength(text, font=font)) + 10, 28], fill=(0, 0, 0))
        dr.text((5, 3), text, fill=(255, 255, 255), font=font)
        ims.append(im)
    if not ims:
        return
    sheet = Image.new("RGB", (sum(i.width for i in ims) + 6 * (len(ims) - 1), h), (255, 255, 255))
    x = 0
    for im in ims:
        sheet.paste(im, (x, 0))
        x += im.width + 6
    sheet.save(out, quality=88)


# ------------------------------------------------------------------ text -------------------------------------------

def report_md(b: dict) -> list[str]:
    """The report's own block: every moment with its strip, what happens, how, and the clip."""
    mo = b.get("moments") or {}
    items = mo.get("items") or []
    if not items:
        return []
    L = ["", T("## 特殊时刻", "## Special moments"), ""]
    for it in items:
        L += [T("### {id} · {k} · {t}", "### {id} · {k} · {t}", id=it["id"], k=KIND.get(it["kind"], it["kind"]), t=fmt_time(it["t"])[:-2]), ""]
        f = it.get("files") or {}
        if f.get("strip"):
            L += [f"![{it['id']}]({f['strip']})", ""]
        ex = it.get("explain") or {}
        if f.get("slow"):
            L.append(T("- **揭秘时刻慢放**：[{c}]({c})（前 1 秒和后 1 秒 1/3 速，变化那一段每帧停 0.2 秒，都带时间；关键一帧画圈并停住）",
                       "- **The change, slowed**: [{c}]({c}) (a second before and after at 1/3 speed, the change itself held 0.2 s a frame, all timed; the key frame ringed and held)", c=f["slow"]))
        if f.get("reveal"):
            L += [T("- **揭秘短片**：[{c}]({c})（原速 → 变化过程慢放放大 → 定格 → 反应）", "- **Reveal clip**: [{c}]({c}) (at speed → the change slowed and zoomed → held → reaction)",
                    c=f["reveal"]), ""]
        if it.get("what"):
            L.append(T("- **发生了什么**：{x}", "- **What happens**: {x}", x=it["what"]))
        for j, st in enumerate(ex.get("steps") or [], start=1):
            L.append(f"  {j}. {st['t']:g}s {'**' + st['text'] + '**' if st.get('key') else st['text']}")
        for k, zh, en in (("seen", "看得到的", "Seen"), ("guess", "看不到的", "Not on screen"), ("why", "为什么没发现", "Why it's missed")):
            if ex.get(k):
                L.append(f"- **{T(zh, en)}**{T('：', ': ')}{ex[k]}")
        if it.get("how") and not ex.get("guess"):
            L.append(T("- **怎么做到的 / 细节**：{x}", "- **How / detail**: {x}", x=it["how"]))
        L.append(T("- **关键帧**：", "- **Key frames**: ") + T("，", ", ").join(f"{ROLE[r]} {it['frames'][r]:.1f}s" for r in ROLES if r in it["frames"])
                 + (T("（手法窗口 {a:.1f}–{z:.1f}s）", " (method window {a:.1f}–{z:.1f}s)", a=it["method_span"][0], z=it["method_span"][1]) if it.get("method_span") else ""))
        if f.get("clip"):
            L.append(T("- **片段**：[{c}]({c})（{a:.1f}–{z:.1f}s，带声音）", "- **Clip**: [{c}]({c}) ({a:.1f}–{z:.1f}s, with sound)",
                       c=f["clip"], a=it["span"][0], z=it["span"][1]))
        L.append("")
    L.append(T("_特殊时刻由 {by} 看图找出；手法和穿帮是推测。_", "_Special moments found by {by} looking at the frames; methods and goofs are guesses._",
               by=_by(mo.get("looked_by"))))
    return L


def _by(by: str | None) -> str:
    return {"vlm": "VLM", "agent": "agent"}.get(by or "", by or "agent")


def videomd(b: dict) -> list[str]:
    """For the model pack: the moments, one line each, or how to find them."""
    mo = b.get("moments") or {}
    items = mo.get("items") or []
    if items:
        L = ["## " + T("特殊时刻", "Special moments"), ""]
        for it in items:
            fr = " ".join(f"{r} {it['frames'][r]:.2f}" for r in ROLES if r in it["frames"])
            fs = it.get("files") or {}
            L.append(f"- {it['id']} {it['kind']} {it['t']:.2f}s | {fr} | {it.get('what', '')}"
                     + (f" | how~ {it['how']}" if it.get("how") else "") + (f" | {fs['clip']}" if fs.get("clip") else "")
                     + (f" | {fs['reveal']}" if fs.get("reveal") else ""))
            ex = it.get("explain") or {}
            if ex.get("steps"):
                L.append("  - steps: " + (f"frames {ex['frames'][0]:.2f}-{ex['frames'][1]:.2f} | " if ex.get("frames") else "") + "; ".join(("*" if s.get("key") else "") + f"{s['t']:.1f} {s['text']}" for s in ex["steps"])
                         + "".join(f" | {k}~ {ex[k]}" if k == "guess" else f" | {k}: {ex[k]}" for k in ("seen", "guess", "why") if ex.get(k)))
        return L
    if mo.get("status") == "done":
        return ["## " + T("特殊时刻", "Special moments"), "", T("- 看过了，没有找到特殊时刻", "- Looked: no special moments found")]
    L = ["## " + T("特殊时刻", "Special moments"), "",
         T("- 还没有看图找：运行 `rea-video moments <本目录>`，按输出看图作答（开了 VLM 时 decompose 会自动做）",
           "- Not looked for yet: run `rea-video moments <this dir>` and answer from the images (decompose does it itself with a VLM)")]
    if mo.get("genre") == "magic":
        L.append(T("- 这是魔术视频：建议找出每段魔术的变化瞬间", "- This is a magic video: find each trick's reveal"))
    hs = mo.get("hints") or []
    if hs:
        L.append(T("- 工具候选（只供参考，约一成是真的）：", "- Tool hints (for reference, about one in ten is real): ")
                 + "; ".join(f"{h['t']:.1f}s {'/'.join(h['why'])}" for h in hs[:10]))
    return L


def summary_line(b: dict) -> str | None:
    items = (b.get("moments") or {}).get("items") or []
    if not items:
        return None
    return T("特殊时刻", "Special moments") + ": " + "; ".join(
        f"{it['id']} {fmt_time(it['t'])[:-2]} {KIND.get(it['kind'], it['kind'])}" + (f" {it['what'][:60]}" if it.get("what") else "") for it in items)
