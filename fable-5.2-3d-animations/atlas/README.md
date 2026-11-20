# 3D Style Atlas

A local library of 100 three.js animation styles. Each card plays a short sample and has a **Copy prompt** button. The prompt gives Claude the style source, the kit (`kit/stage.js`, `kit/sound.js`) and your topic, so Claude can rebuild the style for your subject.

No build step and no npm packages. three.js core only.

## Serve it

The pages load scripts with `fetch`, so open them through a local web server, not as `file://`.

```
cd atlas
python -m http.server 8000
```

Then open <http://localhost:8000/index.html>.

The pages need an internet connection: three.js comes from jsDelivr and the fonts come from Google Fonts.

## Use it

1. Open `index.html`. The cards show the 100 styles in 13 families. Use the family chips or the search box to filter.
2. Click a card. A panel opens and plays the sample.
3. Type your topic in the topic box.
4. Optional: click **With voiceover** and paste your SRT or word timestamps.
5. Optional: tick **Storyboard first**. Claude then renders one still per beat and waits for your OK before it builds.
6. Click **Copy prompt** and paste the prompt into Claude. **Open in player** opens the style in `player.html`.

`art.html` (link at the top of `index.html`) is the same kind of gallery for the 100 art styles. An art style is a post shader that redraws a scene. Each card shows it on Tiny Diorama; the window can switch to Floating Screens. Its prompt adds the art-style source to the scene source and the kits.

### The player

`player.html?style=<id>` plays one style.

| Control | What it does |
| --- | --- |
| Play / scrub bar | Plays the style or moves to a time. |
| Load SRT | Times the beats to the cues of a voiceover. Load the audio file there too. |
| Record WebM | Records picture and sound in real time, from 0 to the end. A slow machine can drop frames. |
| Save WAV | Renders the sound track offline and saves it. |

URL options: `t=<seconds>` starts at a time; `still=1` renders one frame and sets the page title to `ready` (for screenshots); `samples=<n>` sets motion-blur samples.

### Stills from the command line

Headless Chrome on this machine renders WebGL with no extra flags:

```
chrome --headless=new --window-size=1920,1080 --virtual-time-budget=8000 --screenshot=out.png "http://localhost:8000/player.html?style=low-poly&t=5&still=1"
```

## Add a style

1. Copy a style file in `styles/` that is close to what you want. Rename it to `styles/<new-id>.js`.
2. Change `STYLES['<id>']` and the `id` field to the new id.
3. Fill in the text fields: `name`, `family`, `use`, `look`, `motion`, `shownHere`, `goodFor`, `fonts`, `duration` (8 to 12 s), `samples`.
4. Write 3 to 5 `beats`, each `{ t, label }`. The first beat starts at `t: 0`.
5. Write `build(S)`. It makes the scene and returns `update(t, realT)`. `t` is the story time (beats); `realT` is clock time (use it for idle motion). Every frame must depend only on `t` and `realT`, so that seeking gives the same picture.
6. Write `sound(k)`. Give each beat at least one sound: `k.play(name, { t, gain, pitch, dur })`, `k.bed(name, { gain })`, or `k.custom(fn, { t, gain })`.
7. Optional: `post` with a GLSL function `vec4 postFX(vec2 uv)` for a screen effect.
8. Add a row for the style to `styles/manifest.js`. The `name`, `family`, `use` and `look` in the row must be the same as in the style file.
9. In `tools/test.mjs`, change the expected total (100) and the count for the style's family (the `want` table).
10. Run the checks:

```
node tools/test.mjs
```

Then open `player.html?style=<new-id>` and look at `t = 0`, the middle and the end. Frame 0 must be a complete picture, and no label may be cut by the frame edge.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The gallery and the prompt builder. |
| `player.html` | Plays one style; SRT timing, WebM, WAV. |
| `kit/stage.js` | Renderer, lights, labels, camera paths, post pass, time warp. |
| `kit/sound.js` | Instruments and beds made in code, offline render. |
| `kit/prompt.js` | Builds the prompt; SRT parser. |
| `styles/manifest.js` | One row per style: id, name, family, look, demo topic. |
| `styles/<id>.js` | One style each. |
| `posters/<id>.jpg` | A still for each card. |
| `art.html` | The art-style gallery and prompt builder. |
| `art/manifest.js`, `art/<id>.js` | One row and one file per art style. |
| `art-posters/<id>.jpg` | A still for each art-style card (Tiny Diorama, t = 5 s, 8 samples, 640x360). |
| `tools/test.mjs` | Automated checks (Node, no dependencies). |
