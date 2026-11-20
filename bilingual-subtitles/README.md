# bilingual-video-subtitles

A [Claude Code](https://claude.com/claude-code) / Claude Agent skill that burns beautiful **bilingual subtitles** into a video: one language on top (say Chinese) in a rounded box, the other below it (say English, bold), white text, centered or shifted to clear a corner webcam.

It was built for Chinese over English, but it works for any CJK over Latin pair.

## Why it exists

Most subtitle tutorials tell you to use ffmpeg's `subtitles=` or `ass=` filter. That filter needs **libass**, and many ffmpeg builds (including Homebrew's slim `ffmpeg`) ship without it, so the command just fails.

This skill sidesteps that entirely. It renders each caption as a transparent PNG with Pillow, then composites the PNGs onto the video with ffmpeg's `overlay` filter, which every build has. Bonus: you get pixel perfect rounded boxes and true bold CJK that libass cannot easily produce.

No libass, no cloud service, no API keys.

## What it handles for you

- Two stacked caption boxes, styled and auto scaled to the video's resolution.
- Smart wrapping: an embedded Latin word (Claude, HTML, Figma, Lissajous) is treated as atomic and never breaks across lines.
- Chinese line head rules (行首禁则): punctuation never starts a line, it hangs on the previous line.
- Auto splitting of any caption that would orphan a single word or run past 3 lines, into shorter timed cues at a clause boundary.
- Fake bold for the CJK line so its weight matches a bold Latin font.

## Requirements

- `python3` with [Pillow](https://python-pillow.org/) (`pip install pillow`)
- `ffmpeg` and `ffprobe` on your PATH
- Optional, only if you start from a video with no transcript:
  [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
  (`pip install faster-whisper`) for the transcription step. The burn engine
  itself needs neither this nor any network.

## Install as a skill

Clone into your Claude skills folder:

```bash
git clone https://github.com/zarazhangrui/bilingual-subtitles.git \
  ~/.claude/skills/bilingual-video-subtitles
```

Then just ask your agent something like "add Chinese and English subtitles to this video" and the skill will trigger.

## Start from just a video (no transcript)

Most people have only a local video. Transcribe it into word-level-timed
segments, translate, then burn:

```bash
# 1) transcribe -> segments.json (transcript in "bottom", accurate times) + words.json
python3 scripts/transcribe_align.py transcribe --video talk.mp4 --out segments.json

# 2) edit segments.json: fix any mis-heard words, fill each "top" with the
#    translation. Keep start/end and the segment boundaries unchanged.

# 3) burn
python3 scripts/burn_bilingual_subs.py burn \
  --video talk.mp4 --subs segments.json --out "talk - subtitled.mp4"
```

Timing comes from **word-level** timestamps, so captions stay locked to the
audio instead of drifting late. If you re-split or heavily reword the
captions, re-sync them with `transcribe_align.py align` before burning (see
[SKILL.md](SKILL.md)).

## Use the burn engine directly

If you already have timed bilingual text, feed `scripts/burn_bilingual_subs.py`
a subtitles JSON:

```json
{
  "segments": [
    {
      "start": 0.02,
      "end": 4.46,
      "top": "中文这一句",
      "bottom": "The English line."
    },
    { "start": 4.49, "end": 6.08, "top": "下一句", "bottom": "Next line." }
  ]
}
```

Preview a single frame, then burn:

```bash
# preview one composited frame at t=98s
python3 scripts/burn_bilingual_subs.py preview \
  --video talk.mp4 --subs segments.json --t 98 --out preview.jpg

# burn the whole video
python3 scripts/burn_bilingual_subs.py burn \
  --video talk.mp4 --subs segments.json --out "talk - subtitled.mp4"
```

For a talking head screencast with a bottom right webcam, add `--position left` to move the captions clear of it. Run `python3 scripts/burn_bilingual_subs.py burn -h` for all style flags (fonts, sizes, box opacity, position, max lines, and more).

See [SKILL.md](SKILL.md) for the full end to end workflow, including transcribing and translating.

## License

MIT. See [LICENSE](LICENSE).

Made by [Zara Zhang](https://x.com/zarazhangrui).
