# 3D Style Atlas: 100 three.js animation styles

**Play with it live: <https://az9713.github.io/fable-5.2-3d-animations/atlas/>**

**The 100 art styles: <https://az9713.github.io/fable-5.2-3d-animations/atlas/art.html>**

**The formula of each art style: <https://az9713.github.io/fable-5.2-3d-animations/art-styles-math.html>**

A library of 100 animation styles in 13 families, built only in code with three.js: no models, no images, no texture files. Each card plays a short sample with sound. Type your topic, click **Copy prompt**, and paste the prompt into Claude. The prompt gives Claude the style source, the rendering kit and the sound kit, so that Claude can rebuild the style for your subject.

[![The gallery](atlas/posters/soft-clay.jpg)](https://az9713.github.io/fable-5.2-3d-animations/atlas/)

## Where the idea comes from

The idea comes from the YouTube video [Claude Makes 3D Animations Easy Now](https://www.youtube.com/watch?v=ZxaMmG71g8c&t=9s). The video shows a three.js "style atlas" with sound design and a voiceover feature. This repository builds the same kind of tool with its own code, its own text and its own 100 styles. It copies no code, text, demo names or branding from the video.

## Who made what

| Part | Model | Evidence |
| --- | --- | --- |
| Design: the product spec, the 100 style designs (name, look, demo topic, technique), the kits, the acceptance checks — `HANDOFF.md` sections 1 to 12 | Claude **Fable 5.2** (`claude-fable-5-2`) | Session `fa936852`: all 71 assistant turns are `claude-fable-5-2`. It wrote and edited `HANDOFF.md` and wrote no file in `atlas/`. |
| Implementation: every file in `atlas/` (kits, gallery, player, 100 styles, posters, tests), the build log in `HANDOFF.md` section 13 | Claude **Opus 5.5** (`claude-opus-5-5`) | Session `037ffe74`: all 1,560 assistant turns are `claude-opus-5-5`, with 107 `Write` and 34 `Edit` calls into `atlas/`. |

Counts come from the Claude Code session transcripts. In the Opus session, the advisor tool sent some review questions to Fable 5.2. The advisor only gave advice; Opus 5.5 wrote all the code. No Sonnet or Haiku session took part.

## Run it locally

The pages load scripts with `fetch`, so open them through a web server, not as `file://`:

```
cd atlas
python -m http.server 8000
```

Then open <http://localhost:8000/index.html>. The pages need an internet connection: three.js comes from jsDelivr and the fonts from Google Fonts.

See [`atlas/README.md`](atlas/README.md) for the player controls (SRT timing, Record WebM, Save WAV), command-line stills and how to add a style. Run the checks with `node atlas/tools/test.mjs` (last result: 2438 passed, 0 failed).

## Files

| Path | What it is |
| --- | --- |
| `atlas/index.html` | The gallery and the prompt builder. |
| `atlas/art.html` | The gallery of the 100 art styles (post shaders over a scene) and their prompt builder. |
| `atlas/player.html` | Plays one style; SRT timing, WebM, WAV. |
| `atlas/kit/` | Rendering kit (`stage.js`), sound kit (`sound.js`), prompt builder (`prompt.js`). |
| `atlas/styles/` | One file per style, plus `manifest.js`. |
| `atlas/posters/` | One still per card. |
| `atlas/art/`, `atlas/art-posters/` | One file per art style plus `manifest.js`; one still per art-style card. |
| `atlas/tools/test.mjs` | Automated checks (Node, no dependencies). |
| `HANDOFF.md` | The design spec and the build log. |
