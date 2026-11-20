---
name: fable-5.2-3d-animations
description: 3D Style Atlas with Fable 5.2: 100 Three.js animation styles in 13 families plus 100 art styles, each with a copy-ready prompt that gives Claude the full style source, the render kit and the sound kit. Use when making a 3D animation or art-styled scene with Fable 5.2 / Claude, or when a 3D animation style or art look is needed. No build step, no npm packages, three.js core only.
---

# fable-5.2-3d-animations

A local 3D Style Atlas: 100 three.js animation styles in 13 families (`atlas/index.html`) plus 100 art styles (`atlas/art.html`). Each card plays a short sample and has a **Copy prompt** button. The prompt gives Claude the style source, the kit (`kit/stage.js`, `kit/sound.js`) and your topic, so Claude can rebuild the look for your content.

## Serve it first

The pages load scripts with `fetch`, so open them through a local web server, not as `file://`:

```
cd atlas
python -m http.server 8000
```

Then open <http://localhost:8000/index.html>. The pages need an internet connection: three.js comes from jsDelivr and the fonts come from Google Fonts.

## Use the animation atlas

1. Open `index.html`. The cards show the 100 styles in 13 families. Use the family chips or the search box to filter.
2. Click a card. A panel opens and plays the sample.
3. Type your topic in the topic box.
4. Optional: click **With voiceover** and paste your SRT or word timestamps.
5. Optional: tick **Storyboard first**. Claude then renders one still per beat and waits for your OK before it builds.
6. Click **Copy prompt** and paste the prompt into Claude. **Open in player** opens the style in `player.html`.

## Use the art atlas

`art.html` (link at the top of `index.html`) is the same kind of gallery for the 100 art styles. An art style is a post shader that redraws a scene. Each card shows it on Tiny Diorama; the window can switch to Floating Screens. Its prompt adds the art-style source to the scene source and the kits. The scene style is the carrier, the art style is the look.

## The player

`player.html?style=<id>` plays one style.

| Control | What it does |
|---|---|
| Play / scrub bar | Plays the style or moves to a time. |
| Load SRT | Times the beats to the cues of a voiceover. Load the audio file there too. |
| Record WebM | Records picture and sound in real time, from 0 to the end. A slow machine can drop frames. |
| Save WAV | Renders the sound track offline and saves it. |

## What is in this folder

- `atlas/index.html`, `atlas/art.html`, `atlas/player.html`: the three atlas pages.
- `atlas/styles/`: the 100 animation style sources (one `.js` per style).
- `atlas/art/`: the 100 art style sources (one `.js` per style).
- `atlas/kit/`: `prompt.js` (prompt builder and SRT parser), `stage.js` (render kit), `sound.js` (sound kit).
- `atlas/tools/`: `art.mjs`, `test.mjs`, `test-vo.srt` (test subtitle file).
- `atlas/README.md`: the upstream atlas readme (serve and use instructions).
- `art-styles-math.html`, `art-styles-plan.html`, `art-styles-plan-v2.html`: upstream planning docs for the art styles.
- `README.md`: the upstream repo readme.

Not included: the poster images (`atlas/posters/`, `atlas/art-posters/`) and the test voiceover audio (`atlas/tools/test-vo.wav`). View the posters and listen upstream. Upstream has no LICENSE file.
