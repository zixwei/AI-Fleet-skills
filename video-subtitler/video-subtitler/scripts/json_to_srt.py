#!/usr/bin/env python3
"""Convert a word-level transcript JSON into a timecoded SRT file.

Input: a JSON array of word objects, each shaped like:
    { "id": "w0", "text": "Hello", "start": 0.0, "end": 0.5 }
(This is exactly what `npx hyperframes transcribe` emits.)

Output: an SRT file with cues grouped for readable on-screen subtitles.

Grouping heuristics (tunable via flags): start a new cue when the line would
get too long, the cue would run too long, there's a noticeable pause, the word
count is too high, or the previous word ended a sentence.

Usage:
    json_to_srt.py transcript.json output.srt
    json_to_srt.py transcript.json output.srt --max-chars 42 --max-dur 5.0
"""
import argparse
import json
import sys


def srt_time(t: float) -> str:
    """Format seconds as SRT timecode HH:MM:SS,mmm."""
    if t < 0:
        t = 0.0
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = int(t % 60)
    ms = int(round((t - int(t)) * 1000))
    if ms == 1000:  # rounding carry
        s += 1
        ms = 0
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def build_cues(words, max_chars, max_dur, max_gap, max_words):
    cues = []
    cur = []

    def flush():
        nonlocal cur
        if cur:
            text = " ".join(w["text"] for w in cur).strip()
            cues.append((cur[0]["start"], cur[-1]["end"], text))
            cur = []

    for w in words:
        if cur:
            prospective = " ".join(x["text"] for x in cur) + " " + w["text"]
            gap = w["start"] - cur[-1]["end"]
            dur = w["end"] - cur[0]["start"]
            if (len(prospective) > max_chars or dur > max_dur
                    or gap > max_gap or len(cur) >= max_words):
                flush()
        cur.append(w)
        # break after sentence-ending punctuation
        if w["text"].rstrip().endswith((".", "!", "?")):
            flush()
    flush()
    return cues


def main():
    p = argparse.ArgumentParser(description="Convert transcript JSON to SRT.")
    p.add_argument("input", help="word-level transcript JSON")
    p.add_argument("output", help="output .srt path")
    p.add_argument("--max-chars", type=int, default=42,
                   help="max characters per cue line (default 42)")
    p.add_argument("--max-dur", type=float, default=5.0,
                   help="max cue duration in seconds (default 5.0)")
    p.add_argument("--max-gap", type=float, default=0.8,
                   help="split when silence between words exceeds this (default 0.8)")
    p.add_argument("--max-words", type=int, default=12,
                   help="max words per cue (default 12)")
    args = p.parse_args()

    with open(args.input) as f:
        words = json.load(f)

    if not isinstance(words, list) or not words:
        sys.exit("Input JSON must be a non-empty array of word objects.")

    cues = build_cues(words, args.max_chars, args.max_dur, args.max_gap, args.max_words)

    with open(args.output, "w") as f:
        for idx, (start, end, text) in enumerate(cues, 1):
            if end <= start:  # guard against zero/negative duration
                end = start + 0.4
            f.write(f"{idx}\n{srt_time(start)} --> {srt_time(end)}\n{text}\n\n")

    print(f"Wrote {len(cues)} subtitle cues to {args.output}")


if __name__ == "__main__":
    main()
