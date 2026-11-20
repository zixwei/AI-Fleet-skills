#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Transcribe a video/audio into caption-sized segments with WORD-LEVEL accurate
timing, and (optionally) re-align edited captions back to those word times.

Why word-level: whisper's per-segment timestamps are coarse and drift LATE
during continuous speech, so captions lag the audio more and more. Word-level
timestamps fix this. Each caption unit here takes its start/end straight from
its first and last word, so timing is tight from the first burn.

Typical flow (source audio = English, you'll translate to a second language):
  1) transcribe:
       python3 transcribe_align.py transcribe --video talk.mp4 --out segments.json
     -> writes segments.json (accurate times, English in "bottom", "top" empty)
        and words.json (every word + timestamp) next to it.
  2) You / the agent edit segments.json: fix any transcription errors in
     "bottom", and fill "top" with the translation. KEEP the start/end and the
     segment boundaries -> timing stays word-accurate, no re-align needed.
  3) (only if you re-segmented or heavily reworded) re-sync:
       python3 transcribe_align.py align --subs segments.json --words words.json \
           --out segments.json --side bottom
  4) burn with burn_bilingual_subs.py.

Requires: faster-whisper (`pip install faster-whisper`) for `transcribe`,
numpy for `align`, and ffmpeg/ffprobe on PATH. The burn step itself needs
neither faster-whisper nor numpy.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile


def extract_audio(video):
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-i", video, "-ac", "1", "-ar", "16000", "-vn", tmp],
                   check=True)
    return tmp


# ---------------------------------------------------------------------------
# transcribe
# ---------------------------------------------------------------------------
def group_words(words, max_chars, max_dur, max_gap):
    """Group a flat word list into caption-sized units. Breaks on sentence-end
    punctuation, on a long pause, or when a unit gets too long/too wide."""
    units, cur = [], []
    for w in words:
        if cur:
            gap = w["start"] - cur[-1]["end"]
            dur = cur[-1]["end"] - cur[0]["start"]
            text = "".join(x["w"] for x in cur).strip()
            ends_sentence = text.endswith((".", "?", "!", "…"))
            if ends_sentence or gap > max_gap or dur > max_dur or len(text) > max_chars:
                units.append(cur); cur = []
        cur.append(w)
    if cur:
        units.append(cur)
    return units


def cmd_transcribe(a):
    from faster_whisper import WhisperModel
    audio = extract_audio(a.video) if a.video else a.audio
    try:
        model = WhisperModel(a.model, device="cpu", compute_type="int8")
        segments, info = model.transcribe(
            audio, language=a.language, beam_size=5,
            word_timestamps=True, vad_filter=False,
            condition_on_previous_text=True,
        )
        print(f"detected language: {info.language} "
              f"(p={info.language_probability:.2f})", file=sys.stderr)
        words = []
        for s in segments:
            for w in (s.words or []):
                words.append({"w": w.word, "start": round(w.start, 2),
                              "end": round(w.end, 2)})
            print("  %.1f  %s" % (s.start, s.text.strip()), file=sys.stderr, flush=True)
    finally:
        if a.video and os.path.exists(audio):
            os.remove(audio)

    units = group_words(words, a.max_chars, a.max_dur, a.max_gap)
    side = a.side                       # which slot the transcript fills
    other = "top" if side == "bottom" else "bottom"
    segs = []
    for u in units:
        text = "".join(x["w"] for x in u).strip()
        segs.append({"start": u[0]["start"], "end": u[-1]["end"],
                     side: text, other: ""})
    # keep top/bottom key order stable (top first)
    segs = [{"start": s["start"], "end": s["end"],
             "top": s.get("top", ""), "bottom": s.get("bottom", "")} for s in segs]

    json.dump({"segments": segs}, open(a.out, "w"), ensure_ascii=False, indent=1)
    words_path = a.words or os.path.join(os.path.dirname(os.path.abspath(a.out)), "words.json")
    json.dump(words, open(words_path, "w"), ensure_ascii=False, indent=0)
    print(f"\nwrote {a.out}  ({len(segs)} segments) + {words_path} ({len(words)} words)")
    print(f'transcript is in "{side}"; fill "{other}" with the translation, '
          f"keeping start/end unchanged.")


# ---------------------------------------------------------------------------
# align  (Needleman-Wunsch forced alignment, safety net after re-segmentation)
# ---------------------------------------------------------------------------
def _norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def cmd_align(a):
    import numpy as np
    words = json.load(open(a.words))
    segs = json.load(open(a.subs))["segments"]
    B = [{"n": _norm(x["w"]), "t": x["start"]} for x in words]
    B = [x for x in B if x["n"]]
    A = []
    for si, seg in enumerate(segs):
        for j, t in enumerate(seg.get(a.side, "").split()):
            n = _norm(t)
            if n:
                A.append({"n": n, "seg": si, "first_seen": False})
        # mark the first token of each segment
    # rebuild with first flags
    A = []
    for si, seg in enumerate(segs):
        toks = [t for t in (_norm(x) for x in seg.get(a.side, "").split()) if t]
        for j, n in enumerate(toks):
            A.append({"n": n, "seg": si, "first": j == 0})
    na, nb = len(A), len(B)
    if na == 0 or nb == 0:
        print("nothing to align"); return
    GAP = -1

    def score(x, y):
        if x == y:
            return 2
        if len(x) >= 4 and len(y) >= 4 and (x.startswith(y[:4]) or y.startswith(x[:4])):
            return 1
        return -1

    An = [x["n"] for x in A]
    Bn = [x["n"] for x in B]
    H = np.zeros((na + 1, nb + 1), dtype=np.int32)
    H[:, 0] = np.arange(na + 1) * GAP
    H[0, :] = np.arange(nb + 1) * GAP
    for i in range(1, na + 1):
        ai, prev, row = An[i - 1], H[i - 1], H[i]
        for j in range(1, nb + 1):
            row[j] = max(prev[j - 1] + score(ai, Bn[j - 1]),
                         prev[j] + GAP, row[j - 1] + GAP)
    # backtrack
    matchT = [None] * na
    i, j = na, nb
    while i > 0 and j > 0:
        if H[i][j] == H[i - 1][j - 1] + score(An[i - 1], Bn[j - 1]):
            if score(An[i - 1], Bn[j - 1]) > 0:
                matchT[i - 1] = B[j - 1]["t"]
            i -= 1; j -= 1
        elif H[i][j] == H[i - 1][j] + GAP:
            i -= 1
        else:
            j -= 1
    # interpolate all token times from matched anchors
    idx = [k for k in range(na) if matchT[k] is not None]
    times = [0.0] * na
    if idx:
        for k in range(0, idx[0]):
            times[k] = matchT[idx[0]]
        for p, q in zip(idx, idx[1:]):
            for k in range(p, q):
                times[k] = matchT[p] + (matchT[q] - matchT[p]) * (k - p) / (q - p)
            times[q] = matchT[q]
        for k in range(idx[-1], na):
            times[k] = matchT[idx[-1]]
    for k in range(1, na):
        times[k] = max(times[k], times[k - 1])
    seg_start = {}
    for k, x in enumerate(A):
        if x["first"]:
            seg_start[x["seg"]] = times[k]

    out = []
    for si, seg in enumerate(segs):
        wc = len(seg.get(a.side, "").split())
        out.append({"start": round(seg_start.get(si, seg["start"]), 2),
                    "wc": wc, "top": seg.get("top", ""), "bottom": seg.get("bottom", "")})
    for i in range(1, len(out)):
        if out[i]["start"] < out[i - 1]["start"]:
            out[i]["start"] = out[i - 1]["start"]
    for i, o in enumerate(out):
        nxt = out[i + 1]["start"] if i + 1 < len(out) else B[-1]["t"] + 1.0
        cap = o["start"] + o["wc"] / 3.3 + 1.2
        o["end"] = round(min(nxt, max(o["start"] + 0.6, cap)), 2)
        if o["end"] < nxt and nxt - o["end"] < 0.4:
            o["end"] = round(nxt, 2)
        del o["wc"]
    json.dump({"segments": out}, open(a.out, "w"), ensure_ascii=False, indent=1)
    print(f"aligned {len(out)} segments ({len(idx)}/{na} word anchors matched) -> {a.out}")


# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Transcribe (word-level) + align captions.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("transcribe", help="video/audio -> timed caption segments + words.json")
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--video")
    g.add_argument("--audio", help="a 16k mono wav, if you already extracted it")
    p.add_argument("--out", required=True, help="segments JSON to write")
    p.add_argument("--words", default=None, help="words JSON (default: words.json next to --out)")
    p.add_argument("--model", default="medium", help="whisper model: small|medium|large-v3")
    p.add_argument("--language", default=None, help="force a language code, else auto-detect")
    p.add_argument("--side", choices=["top", "bottom"], default="bottom",
                   help="which slot the transcript fills (default bottom; use top for CJK audio)")
    p.add_argument("--max-chars", type=int, default=90)
    p.add_argument("--max-dur", type=float, default=6.0)
    p.add_argument("--max-gap", type=float, default=0.7)
    p.set_defaults(func=cmd_transcribe)

    p = sub.add_parser("align", help="re-sync edited captions to word timestamps")
    p.add_argument("--subs", required=True)
    p.add_argument("--words", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--side", choices=["top", "bottom"], default="bottom",
                   help="which language matches the transcript/words (default bottom)")
    p.set_defaults(func=cmd_align)

    a = ap.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()
