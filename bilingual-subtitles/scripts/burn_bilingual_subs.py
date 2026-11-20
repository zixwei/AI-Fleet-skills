#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Burn bilingual (CJK-over-Latin) subtitles into a video WITHOUT libass.

Why this exists: many ffmpeg builds (e.g. Homebrew's slim `ffmpeg`) ship
without libass/freetype, so the usual `subtitles=`/`ass=` filters fail.
This renders every subtitle as a transparent PNG with Pillow (giving us
pixel-perfect rounded boxes + true bold CJK) and composites them onto the
video with ffmpeg's `overlay` filter, which every build has.

Design: two stacked rounded black boxes, the top language above the bottom
one, white text, centered (or shifted to clear a corner webcam/PiP).

Subtitle input = a JSON file, either:
    {"segments": [{"start": 0.0, "end": 4.4, "top": "中文…", "bottom": "English…"}, ...]}
or a bare list of those objects, or [start, end, top, bottom] arrays.
("zh"/"en" are accepted as aliases for "top"/"bottom".)

Subcommands:
    stats   --subs S
    md      --subs S --out file.md
    preview --video V --subs S --t 98 --out frame.jpg
    burn    --video V --subs S --out OUT.mp4

Run `python burn_bilingual_subs.py <cmd> -h` for the full flag list.
Requires: Pillow, ffmpeg + ffprobe on PATH.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# Font discovery (macOS-first, with graceful fallbacks)
# ---------------------------------------------------------------------------
# Each candidate is (path, ttc_index). First one that loads wins.
CJK_CANDIDATES = [
    ("/System/Library/Fonts/Hiragino Sans GB.ttc", 1),   # W6, bold-ish
    ("/System/Library/Fonts/PingFang.ttc", 0),
    ("/System/Library/Fonts/STHeiti Medium.ttc", 0),
    ("/System/Library/Fonts/Supplemental/Songti.ttc", 0),
    ("/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc", 0),
    ("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc", 0),
]
LATIN_BOLD_CANDIDATES = [
    ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0),
    ("/System/Library/Fonts/HelveticaNeue.ttc", 1),
    ("/Library/Fonts/Arial Bold.ttf", 0),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 0),
    ("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 0),
]


def _find_font(candidates, size, override=None, override_index=0):
    if override:
        return ImageFont.truetype(override, size, index=override_index)
    for path, idx in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size, index=idx)
            except Exception:
                continue
    raise RuntimeError("No usable font found. Pass --top-font / --bottom-font.")


# ---------------------------------------------------------------------------
# Probe video size / fps / duration
# ---------------------------------------------------------------------------
def probe(video):
    def q(stream_entries):
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0",
             "-show_entries", stream_entries, "-of",
             "default=noprint_wrappers=1:nokey=1", video],
            capture_output=True, text=True, check=True).stdout.split()
        return out
    w, h = (int(x) for x in q("stream=width,height")[:2])
    r = q("stream=r_frame_rate")[0]
    num, den = r.split("/")
    fps = float(num) / float(den)
    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", video],
        capture_output=True, text=True, check=True).stdout.strip())
    return w, h, fps, dur


# ---------------------------------------------------------------------------
# Style: all geometry scales from a 1080p baseline by frame height
# ---------------------------------------------------------------------------
class Style:
    def __init__(self, a, W, H):
        s = H / 1080.0
        self.W, self.H = W, H
        self.top_size = a.top_size or round(45 * s)
        self.bottom_size = a.bottom_size or round(41 * s)
        self.pad_x = round(30 * s)
        self.pad_y = round(13 * s)
        self.radius = round(16 * s)
        self.line_gap = round(6 * s)
        self.box_gap = round(9 * s)
        self.bottom_margin = round((a.bottom_margin if a.bottom_margin is not None else 52) * s)
        self.text_color = (255, 255, 255, 255)
        self.box_color = (0, 0, 0, a.box_alpha)
        self.top_stroke = a.top_stroke if a.top_stroke is not None else max(1, round(1 * s))
        self.bottom_stroke = a.bottom_stroke
        side_safe = round(60 * s)

        # Horizontal placement. Position presets clear a corner PiP/webcam.
        reserve = a.reserve if a.reserve is not None else 0.255 * W
        if a.center_x is not None:
            self.center_x = a.center_x
        elif a.position == "left":
            self.center_x = (W - reserve) / 2
        elif a.position == "right":
            self.center_x = W - (W - reserve) / 2
        else:
            self.center_x = W / 2

        if a.max_text_w is not None:
            self.max_text_w = a.max_text_w
        elif a.position in ("left", "right"):
            usable = W - reserve
            self.max_text_w = usable - 2 * side_safe - 2 * self.pad_x
        else:
            self.max_text_w = 0.78 * W - 2 * self.pad_x

        self.top_font = _find_font(CJK_CANDIDATES, self.top_size,
                                   a.top_font, a.top_font_index)
        self.bottom_font = _find_font(LATIN_BOLD_CANDIDATES, self.bottom_size,
                                      a.bottom_font, a.bottom_font_index)


# Characters that may not begin a wrapped line (Chinese "avoid line head"
# rule, 行首禁则). If a break would put one of these at a line start, it
# instead hangs at the end of the previous line. Covers full- and half-width.
NO_LINE_START = set("，。、；：？！）〕〉》」』】｝’”…·%,.!?:;)]}")
_WORDCHARS = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")


def _is_wordchar(c):
    return c in _WORDCHARS


def _cjk_tokens(text):
    """Tokenize mixed CJK/Latin text. Each Latin word (e.g. 'Claude',
    'front-end', 'Markdown') is ONE atomic token so it never breaks across
    lines; each CJK char/punct is its own token. Returns (text, space_before)."""
    toks, pending_space, i, n = [], False, 0, len(text)
    while i < n:
        c = text[i]
        if c == " ":
            pending_space = True
            i += 1
            continue
        if _is_wordchar(c):
            j = i
            while j < n and (_is_wordchar(text[j]) or
                             (text[j] in "-._/+#'" and j + 1 < n and _is_wordchar(text[j + 1]))):
                j += 1
            toks.append((text[i:j], pending_space))
            i = j
        else:
            toks.append((c, pending_space))
            i += 1
        pending_space = False
    return toks


def _join(toks):
    out = ""
    for k, (t, sp) in enumerate(toks):
        if k > 0 and sp:
            out += " "
        out += t
    return out


def wrap(text, font, max_w, cjk):
    """Greedy wrap to fit max_w pixels.

    CJK side: never breaks inside an embedded Latin word, and never lets a
    forbidden punctuation char start a line (it hangs on the prior line).
    Latin side: classic word wrap."""
    if cjk:
        lines, cur = [], []
        for tok in _cjk_tokens(text):
            if not cur or font.getlength(_join(cur + [tok])) <= max_w:
                cur.append(tok)
            elif tok[0] in NO_LINE_START:        # hang punctuation, don't lead a line
                cur.append(tok)
                lines.append(_join(cur)); cur = []
            else:
                lines.append(_join(cur)); cur = [tok]
        if cur:
            lines.append(_join(cur))
        return lines or [""]
    lines, cur = [], ""
    for word in text.split(" "):
        trial = (cur + " " + word).strip()
        if not cur or font.getlength(trial) <= max_w:
            cur = trial
        else:
            lines.append(cur); cur = word
    if cur:
        lines.append(cur)
    return lines


def _line_h(font, stroke):
    asc, desc = font.getmetrics()
    return asc + desc + 2 * stroke


def _draw_box(draw, lines, font, st, bottom_y, stroke):
    lh = _line_h(font, stroke)
    text_h = lh * len(lines) + st.line_gap * (len(lines) - 1)
    text_w = max(font.getlength(ln) for ln in lines) + 2 * stroke
    box_w = text_w + 2 * st.pad_x
    box_h = text_h + 2 * st.pad_y
    left = st.center_x - box_w / 2
    top = bottom_y - box_h
    draw.rounded_rectangle([left, top, left + box_w, top + box_h],
                           radius=st.radius, fill=st.box_color)
    y = top + st.pad_y
    for ln in lines:
        w = font.getlength(ln) + 2 * stroke
        draw.text((st.center_x - w / 2 + stroke, y + stroke), ln, font=font,
                  fill=st.text_color, stroke_width=stroke,
                  stroke_fill=st.text_color)
        y += lh + st.line_gap
    return top


def render(st, top_text, bottom_text):
    img = Image.new("RGBA", (st.W, st.H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    bottom_lines = wrap(bottom_text, st.bottom_font, st.max_text_w, cjk=False)
    top_lines = wrap(top_text, st.top_font, st.max_text_w, cjk=True)
    b_bottom = st.H - st.bottom_margin
    b_top = _draw_box(d, bottom_lines, st.bottom_font, st, b_bottom, st.bottom_stroke)
    _draw_box(d, top_lines, st.top_font, st, b_top - st.box_gap, st.top_stroke)
    return img


# ---------------------------------------------------------------------------
# Cue splitting: no orphan words, never more than --max-lines per language
# ---------------------------------------------------------------------------
ZH_PUNCT = "，、；：。！？,"


def _orphan_latin(lines):
    return len(lines) >= 2 and len(lines[-1].split()) == 1


def _orphan_cjk(lines):
    return len(lines) >= 2 and len(lines[-1]) <= 2


def _acceptable(st, top, bottom, dur, max_lines, min_dur):
    tl = wrap(top, st.top_font, st.max_text_w, cjk=True)
    bl = wrap(bottom, st.bottom_font, st.max_text_w, cjk=False)
    if len(tl) > max_lines or len(bl) > max_lines:
        return False
    if dur < min_dur:
        return True
    return not (_orphan_latin(bl) or _orphan_cjk(tl))


def _split_latin(text):
    n = len(text); mid = n / 2
    commas = [i + 1 for i, c in enumerate(text) if c == "," and 0.3 * n < i < 0.7 * n]
    if commas:
        i = min(commas, key=lambda x: abs(x - mid))
        return text[:i].strip(), text[i:].strip()
    spaces = [i for i, c in enumerate(text) if c == " "]
    if not spaces:
        return text, ""
    i = min(spaces, key=lambda x: abs(x - mid))
    return text[:i].strip(), text[i:].strip()


def _split_cjk(text):
    n = len(text); mid = n / 2

    def safe(i):
        # a split at index i is unsafe if it cuts through a Latin word
        return not (_is_wordchar(text[i - 1]) and _is_wordchar(text[i]))

    # prefer splitting right after Chinese punctuation
    p = [i + 1 for i, c in enumerate(text)
         if c in ZH_PUNCT and 0.25 * n < i < 0.75 * n and safe(i + 1)]
    if p:
        i = min(p, key=lambda x: abs(x - mid))
        return text[:i].strip(), text[i:].strip()
    # else nearest SAFE character boundary to the middle
    cands = [i for i in range(1, n) if safe(i) and 0.2 * n < i < 0.8 * n] \
        or [i for i in range(1, n) if safe(i)]
    if not cands:
        return text, ""
    i = min(cands, key=lambda x: abs(x - mid))
    return text[:i].strip(), text[i:].strip()


def split_cue(st, s, e, top, bottom, max_lines, min_dur):
    dur = e - s
    if _acceptable(st, top, bottom, dur, max_lines, min_dur):
        return [(s, e, top, bottom)]
    t1, t2 = _split_cjk(top)
    b1, b2 = _split_latin(bottom)
    if not t2 or not b2:
        return [(s, e, top, bottom)]
    frac = len(b1) / max(1, len(b1) + len(b2))
    frac = min(0.75, max(0.25, frac))
    tm = s + dur * frac
    return (split_cue(st, s, tm, t1, b1, max_lines, min_dur)
            + split_cue(st, tm, e, t2, b2, max_lines, min_dur))


# ---------------------------------------------------------------------------
# Subtitle loading
# ---------------------------------------------------------------------------
def load_segments(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    items = data["segments"] if isinstance(data, dict) else data
    segs = []
    for it in items:
        if isinstance(it, (list, tuple)):
            s, e, top, bottom = it[0], it[1], it[2], it[3]
        else:
            s, e = it["start"], it["end"]
            top = it.get("top", it.get("zh", ""))
            bottom = it.get("bottom", it.get("en", ""))
        segs.append((float(s), float(e), top, bottom))
    segs.sort(key=lambda x: x[0])
    return segs


def compute_cues(st, segs, max_lines, min_dur):
    cues = []
    for s, e, top, bottom in segs:
        cues.extend(split_cue(st, s, e, top, bottom, max_lines, min_dur))
    cues.sort(key=lambda c: c[0])
    out = []
    for i, (s, e, top, bottom) in enumerate(cues):
        if i + 1 < len(cues):
            e = min(e, cues[i + 1][0])
        if e - s > 0.05:
            out.append((round(s, 3), round(e, 3), top, bottom))
    return out


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
def _fmt(t):
    m = int(t // 60)
    return f"{m}:{t - m * 60:05.2f}"


def cmd_md(a):
    segs = load_segments(a.subs)
    with open(a.out, "w", encoding="utf-8") as f:
        f.write(f"# Bilingual subtitles ({len(segs)} lines)\n\n")
        for i, (s, e, top, bottom) in enumerate(segs, 1):
            f.write(f"**{i}. [{_fmt(s)} – {_fmt(e)}]**\n- {top}\n- {bottom}\n\n")
    print(f"wrote {a.out} ({len(segs)} lines)")


def cmd_stats(a):
    w, h, fps, dur = probe(a.video) if a.video else (1920, 1080, 60, 0)
    st = Style(a, w, h)
    segs = load_segments(a.subs)
    cues = compute_cues(st, segs, a.max_lines, a.min_dur)
    mt = max(len(wrap(c[2], st.top_font, st.max_text_w, True)) for c in cues)
    mb = max(len(wrap(c[3], st.bottom_font, st.max_text_w, False)) for c in cues)
    short = min(c[1] - c[0] for c in cues)
    print(f"frame={w}x{h} center_x={st.center_x:.0f} max_text_w={st.max_text_w:.0f}")
    print(f"segments={len(segs)} -> cues={len(cues)}; max_top_lines={mt} "
          f"max_bottom_lines={mb} shortest_cue={short:.2f}s")


def cmd_preview(a):
    w, h, fps, dur = probe(a.video)
    st = Style(a, w, h)
    segs = load_segments(a.subs)
    cues = compute_cues(st, segs, a.max_lines, a.min_dur)
    seg = next((c for c in cues if c[0] <= a.t <= c[1]),
               min(cues, key=lambda c: abs(c[0] - a.t)))
    frame = a.out + ".frame.png"
    subprocess.run(["ffmpeg", "-y", "-ss", str(a.t), "-i", a.video,
                    "-frames:v", "1", frame], check=True, capture_output=True)
    base = Image.open(frame).convert("RGBA")
    out = Image.alpha_composite(base, render(st, seg[2], seg[3])).convert("RGB")
    out.save(a.out, quality=95)
    os.remove(frame)
    print(f"wrote {a.out}  (cue: {seg[2][:24]}...)")


def cmd_burn(a):
    w, h, fps, dur = probe(a.video)
    st = Style(a, w, h)
    segs = load_segments(a.subs)
    cues = compute_cues(st, segs, a.max_lines, a.min_dur)
    work = a.work or tempfile.mkdtemp(prefix="bilingual_subs_")
    os.makedirs(work, exist_ok=True)
    blank = os.path.join(work, "blank.png")
    Image.new("RGBA", (w, h), (0, 0, 0, 0)).save(blank)
    rendered = []
    for i, (s, e, top, bottom) in enumerate(cues, 1):
        p = os.path.join(work, f"cue_{i:04d}.png")
        render(st, top, bottom).save(p)
        rendered.append((s, e, p))
    # contiguous [0, dur] timeline of (png, duration)
    entries, t = [], 0.0
    for s, e, p in rendered:
        if s - t > 0.001:
            entries.append((blank, s - t))
        entries.append((p, e - s))
        t = e
    if dur - t > 0.001:
        entries.append((blank, dur - t))
    lst = os.path.join(work, "concat.txt")
    with open(lst, "w", encoding="utf-8") as f:
        f.write("ffconcat version 1.0\n")
        for p, d in entries:
            f.write(f"file '{p}'\nduration {d:.3f}\n")
        f.write(f"file '{entries[-1][0]}'\n")
    print(f"cues={len(cues)} entries={len(entries)} work={work}")
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-stats",
        "-i", a.video, "-f", "concat", "-safe", "0", "-i", lst,
        "-filter_complex",
        f"[1:v]format=rgba,fps={fps:g}[ov];[0:v][ov]overlay=0:0:eof_action=pass[v]",
        "-map", "[v]", "-map", "0:a?",
        "-c:v", "libx264", "-crf", str(a.crf), "-preset", a.preset,
        "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart",
        a.out,
    ]
    subprocess.run(cmd, check=True)
    print(f"\nDONE -> {a.out}")


# ---------------------------------------------------------------------------
def add_style_args(p):
    p.add_argument("--position", choices=["center", "left", "right"], default="center",
                   help="left/right shifts the block to clear a corner webcam/PiP")
    p.add_argument("--reserve", type=float, default=None,
                   help="px on the cam side to keep clear (default ~0.255*W)")
    p.add_argument("--center-x", type=float, default=None, help="explicit block center x in px")
    p.add_argument("--max-text-w", type=float, default=None, help="explicit max text width in px")
    p.add_argument("--top-size", type=int, default=None)
    p.add_argument("--bottom-size", type=int, default=None)
    p.add_argument("--bottom-margin", type=float, default=None)
    p.add_argument("--box-alpha", type=int, default=200, help="0-255, box opacity")
    p.add_argument("--top-stroke", type=int, default=None, help="fake-bold thickness for top (CJK)")
    p.add_argument("--bottom-stroke", type=int, default=0)
    p.add_argument("--top-font", default=None)
    p.add_argument("--top-font-index", type=int, default=0)
    p.add_argument("--bottom-font", default=None)
    p.add_argument("--bottom-font-index", type=int, default=0)
    p.add_argument("--max-lines", type=int, default=3, help="max wrapped lines per language")
    p.add_argument("--min-dur", type=float, default=1.4, help="never split a cue shorter than this")


def main():
    ap = argparse.ArgumentParser(description="Burn bilingual subtitles (libass-free).")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("md"); p.add_argument("--subs", required=True); p.add_argument("--out", required=True)
    p.set_defaults(func=cmd_md)

    p = sub.add_parser("stats"); p.add_argument("--subs", required=True); p.add_argument("--video", default=None)
    add_style_args(p); p.set_defaults(func=cmd_stats)

    p = sub.add_parser("preview")
    p.add_argument("--video", required=True); p.add_argument("--subs", required=True)
    p.add_argument("--t", type=float, required=True); p.add_argument("--out", required=True)
    add_style_args(p); p.set_defaults(func=cmd_preview)

    p = sub.add_parser("burn")
    p.add_argument("--video", required=True); p.add_argument("--subs", required=True)
    p.add_argument("--out", required=True); p.add_argument("--work", default=None)
    p.add_argument("--crf", type=int, default=18); p.add_argument("--preset", default="medium")
    add_style_args(p); p.set_defaults(func=cmd_burn)

    a = ap.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()
