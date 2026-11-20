---
name: video-subtitler
description: Generate clean, timecoded SRT subtitles for a video by transcribing it locally with Whisper. Takes a local video/audio file or a YouTube URL, ensures it's in a readable format, extracts audio, transcribes on-device (no API key), and does a final cleanup pass for typos, capitalization, and brand names. Use when the user wants to subtitle/caption a video, create an SRT/captions file, transcribe a video to subtitles, add captions to a YouTube video, or asks to "subtitle this video", "make captions", "generate an SRT", or "transcribe and caption" a local file or YouTube link.
---

# Video Subtitler

Produce a polished, timecoded `.srt` from a video or audio source, entirely on-device. Pipeline: get the media local → extract audio → transcribe to SRT with Whisper → clean up typos and brand names.

## Prerequisites

Minimal by design — two tools cover the common case:

- **`ffmpeg` / `ffprobe`** — audio extraction + probing. Check `which ffmpeg ffprobe`; install with `brew install ffmpeg`.
- **`whisper-cli`** (whisper.cpp) — the transcriber. Tiny (~8 MB), MIT, pure C/C++, no Python/PyTorch, runs fast on Apple Silicon, and writes SRT directly. Check `which whisper-cli`; install with `brew install whisper-cpp`.
- **`yt-dlp`** — only when the input is a YouTube URL. `brew install yt-dlp`.

whisper.cpp needs a GGML model file (not bundled). See "Getting a Whisper model" below — reuse one already on disk before downloading.

Alternative transcribers exist (`openai-whisper` via pip, `npx hyperframes transcribe`) but each is a heavier dependency; see "Alternative transcribers". Default to whisper.cpp.

## Workflow

Run in order. Work in the media's directory (or a temp dir for downloads) and name outputs after the source basename.

### 1. Get the media local

**YouTube URL** — you only need audio for subtitles, so grab the audio track:

```bash
yt-dlp -f "ba/b" -x --audio-format mp3 -o "%(title)s.%(ext)s" "<URL>"
```

(If the user also wants the video file: `yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b" -o "%(title)s.%(ext)s" "<URL>"`.)

**Local file** — confirm it exists and probe it:

```bash
ffprobe -v error -show_entries format=duration,size,format_name -of default=noprint_wrappers=1 INPUT
ffprobe -v error -select_streams a -show_entries stream=codec_name,channels,sample_rate -of default=noprint_wrappers=1 INPUT
```

### 2. Extract audio to a Whisper-friendly WAV

Always extract audio rather than feeding the full video — far faster and it sidesteps container/codec issues (this doubles as the "make sure it's readable" check, since ffmpeg fails loudly on a corrupt/unsupported file). Whisper wants mono 16 kHz 16-bit PCM:

```bash
ffmpeg -y -i INPUT -vn -ac 1 -ar 16000 -c:a pcm_s16le BASENAME.wav
```

Flags: `-vn` drop video, `-ac 1` mono, `-ar 16000` 16 kHz, `-c:a pcm_s16le` 16-bit PCM.

### 3. Transcribe directly to SRT

```bash
whisper-cli -m MODEL.bin -f BASENAME.wav -osrt -of BASENAME \
  --max-len 42 --split-on-word \
  --prompt "Retool, Replit, ServiceNow, OAuth"
```

Writes `BASENAME.srt` with standard `HH:MM:SS,mmm` timecodes. Key flags:

- `--max-len 42 --split-on-word` — caps each cue at ~42 readable characters, breaking on word boundaries. Good default for on-screen subtitles.
- `--prompt "<names>"` — seeds Whisper with correct spellings of brand/product names and jargon so it gets them right the first time. **Ask the user for their brand/product names and put them here** — it dramatically shrinks the step-5 cleanup. (Quote the whole list as one argument.)
- `-l auto` — add this for non-English or unknown-language audio (default is `en`). whisper.cpp transcribes in the source language; it does not silently translate.

For noisy audio, music, or high-stakes accuracy, use a larger model (see below).

### 4. (Optional) Custom cue grouping via word-level JSON

Only if `--max-len`/`--split-on-word` cue boundaries aren't good enough and you need finer control (e.g. split on pauses, sentence boundaries, max words). Transcribe to a word-level JSON instead, then run the bundled grouper:

```bash
# produce a word-level transcript.json (e.g. via `npx hyperframes transcribe`, or whisper-cli -oj)
python3 SKILL_DIR/scripts/json_to_srt.py transcript.json BASENAME.srt \
  --max-chars 42 --max-dur 5.0 --max-gap 0.8 --max-words 12
```

The script groups words into cues (line length, duration, pause gaps, sentence-ending punctuation) and emits SRT. Most jobs won't need this — whisper.cpp's native segmentation is fine.

### 5. Final cleanup pass

Whisper still mangles proper nouns and casing even with `--prompt`. Do a deliberate pass — this is what makes the file shippable. Don't skip it.

1. Trim whisper.cpp's leading space on each cue line (cosmetic):
   ```bash
   sed -i '' 's/^ //' BASENAME.srt
   ```
2. Scan for likely errors (brands + probable misspellings, case-insensitive):
   ```bash
   grep -niE "replet|retool|service ?now|salesforce|workday|netsuite|oauth|github|postgres" BASENAME.srt
   ```
3. Fix in place (Edit, or `sed -i ''` for repeated substitutions). Patterns seen in practice:
   - misheard brand spellings → correct form (`Replet`→`Replit`)
   - lowercased brands → proper case (`retool`→`Retool`, `service now`→`ServiceNow`)
   - product/tech terms → canonical casing (`react app`→`React app`, `o auth`→`OAuth`)
   - obvious in-context homophone/typo errors
   - **leave URLs lowercase** (`retool.com` stays — don't "fix" it)
4. Verify corrections landed:
   ```bash
   grep -oE "Replit|Retool|ServiceNow|Salesforce|OAuth" BASENAME.srt | sort | uniq -c
   ```

### 6. Clean up intermediates

```bash
rm -f BASENAME.wav
```

Report the final `.srt` path and cue count.

## Getting a Whisper model

whisper.cpp needs a GGML `.bin` model. **Check for one already on disk first** (avoids a redundant download):

```bash
find ~ /opt/homebrew -iname "ggml-*.bin" 2>/dev/null
```

Common existing locations: `~/.cache/hyperframes/whisper/models/`, `~/Library/Application Support/MacWhisper/models/`.

If none, download one (one-time) from Hugging Face:

```bash
curl -L -o ggml-base.en.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
```

| Model | Size | When |
| --- | --- | --- |
| `ggml-base.en.bin` | ~148 MB | Clear English speech — good default |
| `ggml-small.en.bin` | ~466 MB | Better English accuracy |
| `ggml-small.bin` | ~466 MB | Non-English / unknown language |
| `ggml-medium.bin` / `ggml-large-v3.bin` | 1.5 / 3.1 GB | Noisy audio, music, max accuracy |

Use `.en` models **only** for English audio; for any other language use the non-`.en` variant with `-l <code>` or `-l auto`.

## Alternative transcribers

If `whisper-cli` isn't available and can't be installed, in order of preference:

- **`openai-whisper`** (`pip install -U openai-whisper`) — reference implementation, also writes SRT directly: `whisper BASENAME.wav --model small --output_format srt`. Heavy: pulls in PyTorch (~2 GB+).
- **`npx hyperframes transcribe BASENAME.wav --model small`** — only sensible if HyperFrames is already installed (it's a video-tooling package, not a general transcriber). Emits word-level JSON, so pair it with step 4 to get an SRT.

## Notes

- Replace `SKILL_DIR` with this skill's directory, and `MODEL`/`BASENAME`/`INPUT` with real values.
- Transcription time scales with audio length and model size. `base.en`/`small.en` are the sweet spot for clear English.
- Attach captions to a YouTube upload: YouTube Studio → the video → Subtitles → Add language → Upload file → **With timing** → select the `.srt`.
