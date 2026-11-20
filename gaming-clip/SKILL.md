---
name: gaming-clip
description: Turn YouTube gaming videos (or local recordings) into vertical 1080x1920 shorts with this repo's Bun pipeline - download, whisper.cpp transcript, highlight picking, webcam detection and repositioning, per-clip subtitles, web review UI, render. Use when asked to clip a gaming video, find funny/engaging moments, make shorts/reels/TikToks from a stream or let's-play, or open the clip editor.
---

# gaming-clip

Everything runs from the repository root with Bun. The CLI (`bun run clip ...`) and the web UI
(`bun run start`) work on the same `workspace/projects/<id>/project.json`, so they can be used
together: changes made by the CLI show up live in an open browser tab.

## 0. Preflight

```bash
bun install
bun run clip doctor      # ffmpeg, ffprobe, yt-dlp, whisper-cli + 2 model files (whisper, face detector)
bun run setup            # only when doctor reports something missing: installs tools (Homebrew on macOS, downloads into tools/ otherwise) and models (~575 MB once)
```

## 1. Ingest

```bash
# You pick the moments yourself (preferred when an agent is driving):
bun run clip new "<youtube-url>" --no-highlights --json
# Or let the built-in engine pick (heuristics; a model when LLM_COMMAND or LLM_MODEL is set in .env).
# --clips auto (the default) lets the engine decide how many moments are worth posting; --clips N asks
# for a target count (1-60):
bun run clip new "<youtube-url>" --clips auto --min 20 --max 60 --json
```

- Several URLs / local files can be passed at once; each becomes a project.
- `--lang id` (or any whisper code) when the spoken language is known; default `auto`.
- stdout is a JSON array of projects; take `.[0].id`. Progress goes to stderr.
- A 7-minute 720p video takes about 30 s end to end on an M1 Pro; transcription dominates.

## 2. Pick the moments (you are the highlight engine)

```bash
bun run clip transcript <id>                        # whole video
bun run clip transcript <id> --from 10:00 --to 20:00   # read long videos in windows
```

Lines look like `[04:33.2 -> 04:39.0] text (LOUD +12dB)`. `(LOUD +NdB)` marks audio spikes over the
video's baseline (screams, laughter, explosions); `(no speech, LOUD ...)` lines mark loud moments
without words. Use both signals.

What makes a good gaming short:

- A reaction with a cause: jump scare, clutch, fail, rage, unexpected glitch, a joke that lands.
- Self-contained: include the setup (usually 5-15 s before the peak) and the payoff plus a beat of
  reaction after it. Never start or end mid-sentence: use the transcript timestamps as boundaries.
- A strong first two seconds. Skip channel intros, sponsor reads, menus and loading.
- 20-60 s. Fewer strong clips beat many weak ones. Do not overlap clips.
- Only claim what the transcript and loudness show; you cannot see the gameplay. If a pick depends
  on a visual, check it: `bun run clip frame <id> <time> /tmp/f.jpg` and look at the image.

Write the picks to a JSON file and load them (replaces all earlier non-manual clips):

```json
[
  {
    "start": "2:28",
    "end": "2:54",
    "title": "The monster was behind him the whole time",
    "reason": "Jump scare at 2:41 (+13 dB) after a calm setup, big reaction",
    "score": 92
  }
]
```

```bash
bun run clip clips set <id> picks.json
bun run clip show <id>          # clips table: ids, times, scores, settings, render status
```

`start`/`end` accept seconds or `M:SS(.s)`. Titles should be in the video's language.

## 3. Check the webcam rectangle

Detection runs during ingest. Verify it visually before rendering split layouts:

```bash
bun run clip show <id> --json | jq .webcam
bun run clip frame <id> 120 /tmp/cam.jpg --crop webcam   # must show exactly the facecam, nothing else
bun run clip frame <id> 120 /tmp/full.jpg                # full frame for reference
```

Fix it when wrong:

```bash
bun run clip webcam <id> --rect 1500,0,420,236   # x,y,w,h in source pixels
bun run clip webcam <id> --none                  # video has no facecam -> split falls back to fill
bun run clip webcam <id> --detect                # run the detector again
```

## 4. Let the user choose (web UI)

```bash
bun run start        # http://localhost:4321  ->  /project/<id>
```

Tell the user the URL. In the UI they select clips, trim them, choose layout and caption style per
clip with a live preview that matches the final render, fix the webcam rectangle, and render. Stop
here and wait for the user unless they asked for a fully automatic run.

## 5. Headless settings and render

```bash
bun run clip clips select <id> all|none|<clipId,clipId>
bun run clip settings <id> --clips all --layout split --subtitles on --style pop --caption-y 0.7
bun run clip settings <id> --clips <clipId> --subtitles off
bun run clip render <id>                 # selected clips; prints the output files
bun run clip render <id> --clips <clipId>
```

- Layouts: `split` (webcam panel on top, gameplay below; the usual choice when a facecam exists),
  `fill` (gameplay cropped to 9:16; `--focus-x 0..1` moves the crop), `fit` (whole frame over a
  blurred background; use when the HUD or the full width matters).
  `custom` is free-form: `clip settings <id> --clips <clipId> --custom-json layout.json` with
  `{"background":{"kind":"blur"|"color","color":"#rrggbb"},"game":{"src":rect,"dst":rect}|null,
  "cam":{"src":rect,"dst":rect,"feather":0-300,"radius":0-960,"border":0-40,"borderColor":"#rrggbb"}|null}`
  (`src` in source pixels, `dst` in 1080x1920 output pixels). Usually the user designs it in the web UI.
- Caption styles: `pop` (default), `neon`, `box`, `comic`, `clean` (static phrases, no word
  highlight; use for calm commentary), `focus`.
- Subtitles are per clip. Turn them off for clips with little or no speech.
- Outputs: `workspace/projects/<id>/clips/<clipId>-<title>.mp4`, 1080x1920 h264/aac.
- After rendering, look at one frame per clip before reporting success:
  `ffmpeg -v error -y -ss 5 -i <clip.mp4> -frames:v 1 /tmp/check.jpg`.

## 6. Thumbnails

Rendering a clip also writes a cover image `<clipId>-<title>.jpg` next to the mp4 (automatic
frame, clip title as headline). To make a better one:

```bash
bun run clip thumbnail <id> --clips <clipId> --text "HE WAS *RIGHT BEHIND* ME" --style impact --time 2:41
bun run clip thumbnail <id>                 # selected clips with their current thumbnail settings
```

- `--text`: 2-6 punchy words, not the full title; wrap the key word in `*stars*` to colour it.
  `--no-text` writes the frame only, `--title-text` goes back to the clip title.
- `--time T|auto`: `auto` picks a sharp frame near the loudest moment. It cannot judge
  expressions: for an important clip, look at the result (`read` the jpg) and try the reaction
  moment itself (a little after the scream or laugh in the transcript) when the face is dull.
- `--style`: `impact` (default), `banner`, `neon`, `comic`, `minimal`. `--text-y 0..1` moves the
  headline; keep it off the face.
- Changing a clip's range, layout, focus, or its title (when the title is the headline) discards
  the thumbnail file; generate again.

## 7. Watermarks

Up to 5 overlays per clip, drawn under the captions on every frame (and on the thumbnail when
`onThumbnail` is true). Usually the user places them in the web UI; headlessly:

```bash
bun run clip settings <id> --clips all --watermarks-json marks.json   # every clip AND the project defaults
bun run clip settings <id> --clips <clipId> --no-watermarks           # removes them
```

`marks.json` is an array; coordinates are in the 1080x1920 output frame, `x`/`y` is the CENTRE:

```json
[
  {
    "id": "wm1a",
    "kind": "text",
    "text": "@name",
    "font": "Anton",
    "size": 64,
    "color": "#ffffff",
    "stroke": 4,
    "strokeColor": "#000000",
    "x": 540,
    "y": 1700,
    "rotation": 0,
    "opacity": 0.85,
    "onThumbnail": false
  },
  {
    "id": "wm2b",
    "kind": "image",
    "file": "<name from an upload to /api/projects/<id>/assets>",
    "width": 240,
    "x": 900,
    "y": 160,
    "rotation": 0,
    "opacity": 0.7,
    "onThumbnail": true
  }
]
```

Fonts are `Anton`, `Bangers`, `Poppins ExtraBold`, `Poppins SemiBold`. Image files must be
uploaded through the web UI or the assets API first (PNG, JPEG or WebP). Changing watermarks
discards the clip's rendered file: render again.

## 8. Media library and the editor timeline

Sounds, stickers and intro/outro videos come only from the user's uploads. They live in
`<workspace>/library/` and are shared by every project, so ask the user for a file instead of
inventing one:

```bash
bun run clip library list
bun run clip library add vine-boom.mp3 --name "vine boom"   # type from the extension
bun run clip library rename <file> "bruh"
bun run clip library rm <file>                              # refused while a clip uses it
```

Setting the timeline of a clip by hand (source seconds, like the clip range):

```bash
bun run clip timeline <id> <clipId> timeline.json
bun run clip settings <id> --clips <clipId> --intro <library video> --outro none
```

`timeline.json` is the whole `{"items":[...],"teaser":{start,end}|null}`: items are `zoom`
(scale 1.05-3, x/y 0..1, ease punch|smooth), `shake`, `flash`, `look` (deepfry|bw|blur),
`overlay` (watermark-shaped `element`, animation pop|shake|slide|none), `sound` (library file,
volume 0..2) and `voice` (earrape|bass|chipmunk|deep|echo|robot). Zooms must not overlap, a sound
cannot be longer than its file, and the teaser must lie inside the clip. The server is the
authority: it rejects bad timelines with a 400 and names the field.

Let the AI edit compose it when the user does not care about individual effects:

```bash
bun run clip autoedit <id>                        # selected clips, replaces their timelines
bun run clip autoedit <id> --clips <clipId> --append   # keep existing items and teaser
```

The AI edit uses the Highlight AI when configured and heuristics otherwise. Review the result in
`clip show <id> --json` (`.clips[].timeline`) before rendering.

## 9. Post text (Instagram, TikTok, YouTube Shorts)

After a clip is final, write the text the user pastes when posting. It needs the Highlight AI
(Settings, or `LLM_COMMAND`/`LLM_MODEL` in `.env`); without it the command fails with
"Set up Highlight AI in Settings first". It never runs during ingest or render:

```bash
bun run clip social <id>                       # selected clips, in the video's language
bun run clip social <id> --clips <clipId> --language id
```

Result: Instagram and TikTok caption + hashtags, YouTube title (max 100 chars) + description +
hashtags (always `#Shorts`), stored in `clip.social`. It is written for the clip's current range:
run it again after trimming. Read the text and fix anything wrong before giving it to the user.

## 10. Editing the AI prompts

Settings > Prompts holds two editable guidance texts: how highlights are judged
(`highlightPrompt`) and how post text is written (`socialPrompt`), max 6000 characters, empty =
built-in default. Only the guidance is editable: the JSON answer format, timestamps and clip
length limits are always appended in code, so a custom prompt cannot break parsing. Change them
through the web UI (or `PATCH /api/settings`); there is no env variable.

## Other commands

```bash
bun run clip list
bun run clip clips add <id> <start> <end> "title"    # manual clip, survives `clips set` and re-detection
bun run clip clips rm <id> <clipId>
bun run clip rm <id>                                  # delete a project and its files
```

`--json` on any command prints machine-readable output on stdout. Exit codes: 0 ok, 1 failure,
2 usage error. When a stage fails, `clip show <id>` prints the error. Fix the cause, then
`bun run clip rerun <id>` resumes at the first unfinished stage (`--from transcribe|highlights|webcam`
forces that stage and everything after it to run again).
