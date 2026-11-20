---
name: mg-styles-15
description: Make a 10-second motion-design film in one of 15 styles (flat vector, line art, isometric, 3D render, cel boil, collage, liquid, morph, Bauhaus, synthwave, aurora glass, variety-show captions, sticker explainer, pixel, cyberpunk HUD) from its full prompt, or write a new style prompt from the template. Use when making a short MG film in a named style or when a style prompt is needed. Each film is code (SVG/Canvas/WebGL/Three.js, Blender for the 3D one), not image or video generation.
---

# mg-styles-15

Fifteen motion-design styles, one 10-second film each, all made by Claude Opus 5.5 writing code. Every style ships its full prompt in `prompts/`; the prompt is the skill. Original films scored 7.57-8.21 / 10 from an AI jury.

## The 15 styles

| File | Style | Original film (AI jury) |
|---|---|---|
| `prompts/01-flat-vector.md` | 扁平矢量动画 Flat / Vector 2D Motion Graphics | popwise「One Dot」, 7.64 |
| `prompts/02-line-art.md` | 线条动画 Line Art / Line Animation | ATELIER LINEA「一笔画 One Line」, 7.64 |
| `prompts/03-isometric.md` | 等轴 2.5D Isometric / 2.5D | ISOPOLIS「让城市自己生长」, 8.00 |
| `prompts/04-3d-render.md` | 3D 渲染系(C4D/Blender 质感) 3D Render / CGI Motion Design | soft.「Soft Landing 柔软着陆」, 7.71 |
| `prompts/05-cel-boil.md` | 逐帧手绘 / 线条沸腾 Cel Animation / Frame-by-Frame & Line Boil | 手作 HAND MADE, 8.07 |
| `prompts/06-collage.md` | 拼贴剪贴 Collage / Cutout Animation | NOGGIN「脑洞大开 The Mind Is a Collage」, 8.14 |
| `prompts/07-liquid.md` | 液态流动 Liquid Motion | drop.「万物始于一滴」, 7.57 |
| `prompts/08-morph.md` | 形变动画 Morphing / Shape Morph | 一形万象 One Shape, Every Story, 7.64 |
| `prompts/09-bauhaus.md` | 几何构成 / 包豪斯 Geometric / Bauhaus Motion | KONSTRUKTION · 20 SCHLÄGE「二十拍构成」, 7.71 |
| `prompts/10-synthwave.md` | 复古系(80s Synthwave / Y2K 千禧) Retro: 80s Synthwave / VHS / Y2K | NEON DRIVE · Midnight「霓虹夜驰 1986」, 8.21 |
| `prompts/12-aurora-glass.md` | 弥散渐变 / 玻璃拟态 Gradient Blur (Aurora) & Glassmorphism | Aurora — think in light「思考，自有光」, 8.07 |
| `prompts/18-hanazi.md` | 综艺花字 Variety Show Kinetic Captions (Hanazi) | 喵呜日记 EP.07「今日份快乐」, 7.64 |
| `prompts/19-paperclip.md` | 粗描边贴纸人科普 MG(回形针/林超风格) Bold-outline Sticker Explainer MG (PaperClip / Lin Chao style) | 一部手机里，藏着多少种元素？, 7.71 |
| `prompts/20-pixel.md` | 像素风 Pixel Art / 8-bit | PIXEL QUEST 像素冒险, 8.07 |
| `prompts/22-hud.md` | 赛博朋克 HUD / FUI Cyberpunk HUD / FUI (Fictional UI) | 隼眼-9 · 目标锁定 KESTREL-9 TARGET ACQUIRED, 7.93 |

## How a film is made

One prompt per style, then Claude writes the film as a web page that draws any moment (`window.renderAt(t)`). Headless Chrome renders every frame, `audio.py` synthesises the music and sound effects on the same cues, ffmpeg muxes an exact 10-second MP4, and a second AI reviews it with `rubric.md` for two rounds of revision. No image or video generation: the picture is code (SVG, Canvas, WebGL, Three.js, Blender for the 3D film); a few films use CC0 or public-domain photos. Sound is code too.

## Use an existing style

1. Open an empty folder in a code-writing AI assistant (e.g. Claude Code). The machine needs web rendering (Node + Chrome) and ffmpeg.
2. Copy the whole prompt section from the style's `prompts/*.md` file and send it.
3. To make it your own content: change the story, brand names, copy and palette in `Creative seed`, or the size in `Output` (e.g. vertical 1080x1920). Do not delete the `Signature features` section: it is what makes the style instantly recognisable.
4. To improve it: after the film renders, open a separate AI session, review with `rubric.md`, paste the review back to the making session and revise. The originals went through two such rounds.

Fixed output (from `template.md`): `<width>x<height>`, `<fps>` fps, exactly 10.000 s, H.264 MP4 with stereo AAC audio (48 kHz), mastered to -14 LUFS integrated, true peak <= -1 dBTP. Final file: `video.mp4`.

## Write a new style

Follow `template.md`. A style prompt has a shared generic part (role, How to work / Rules / Craft checklist / self-review / Deliver, identical across styles, copyable from any `prompts/*.md`) plus four style-specific sections:

- `# Style`: `<Chinese style name> <English style name>`.
- `# Output (fixed)`: size, fps, exactly 10.000 s, H.264 MP4 stereo AAC 48 kHz, -14 LUFS, true peak <= -1 dBTP, `video.mp4`.
- `# Suggested technical route`: what to build it with (SVG/Canvas/WebGL/Three.js/Blender) and the key technique. A better route is allowed if it clearly raises quality; say why.
- `# Creative seed`: one-sentence film title plus the style's most classic, most striking reading: what happens second by second (hook, escalation, climax, end frame), palette (3-6 exact colour values), type feel, sound (music style + key effects).
- `# Signature features and key techniques`: the style's origin and use in one or two lines, then comma-separated signature visual features and one executable technique per line (curve parameters, frame counts, layer structure). Make them checkable: write "overshoot uses cubic-bezier(0.34,1.56,0.64,1), staggered 2-4 frames", not "motion should feel elastic".

Rules from the template: the creative seed needs beats by the second or the film comes out flat; brand names and copy should be fictional to avoid trademark issues; the director may change concept, copy, story beats and brand names for a stronger idea, but the result must stay the canonical, instantly-recognisable form of the style and hit its signature features.

## Review a film

`rubric.md` is a two-step jury process. Step 1 (a separate AI session that did not make the film): inspect the film properly (contact sheet every 0.5 s, filmstrips around the fastest moves and the hero moment, full-resolution frames at 5-8 key times), check the spec (exactly 10.00 s, resolution/fps, audio, loudness about -14 LUFS +/-1, true peak <= -1 dBTP, no unintended black or static spans, visual hits aligned with audio onsets), score 1-10 on style_fidelity, concept_wow, motion_craft, design_typography, finish_texture, sound_sync, technical (5 = competent student, 7 = solid professional, 8 = high-end agency, 9 = award shortlist), then give 5-10 fixes ordered by impact, each with timecodes, what is wrong, why it matters and a concrete how-to. Step 2 (back in the making session): keep a copy as version N, implement every critical issue and high-impact fix, re-render, re-check, and report what was applied or skipped and why.

## What is in this folder

`prompts/` (15 verbatim style prompts), `template.md` (new-style template), `rubric.md` (jury review prompts), `README.md` / `README.zh-CN.md` (upstream readmes), `LICENSE` (MIT). Not included: the films' full source (`lib/`), finished videos (`videos/`), demos, site, harness, docs and showcase media. Watch the films and read the source upstream.
