---
name: ai-visual-prompt-cookbook
description: Pick one of 191 visual styles for AI image generation (Nano Banana Pro, GPT Image, Midjourney) from its style.json prompt template, or copy the ready-made prompt. Use when a reusable visual style is needed for an AI-generated image.
---

# ai-visual-prompt-cookbook

191 plug-and-play visual styles for AI image generation. Each style is one `style.json` (prompt template + variables) in `styles/<style-slug>/`, plus a copy-ready prompt in `docs/copy-prompts/<style-slug>.md`. The full catalog with descriptions is in `docs/CATALOG.md`, the machine-readable catalog in `data/catalog.json`, the style format in `schemas/style-v2.1.schema.json`. Preview images are not included in this library; see the upstream repo or gallery for the look.

## Style categories

| Category | Good for | Start with |
| --- | --- | --- |
| Photo + Doodle | Social snapshots, lifestyle scenes, playful overlays | Playful Mascot Doodle Snapshot, Cozy Bedroom Doodle Companion |
| Zine + Collage | Fashion posters, music visuals, maximalist editorial layouts | K-pop Apocalypse Ransom Zine, Y2K Grunge Hip-hop Cutout Poster |
| Type Posters | Big headline systems, loud campaign graphics, visual punch | Impact Burst Halftone Comic Poster, Neon Kinetic Typographic Poster |
| Travel + City | Destination posters, street scenes, urban diaries | Clean Triptych Travel Vlog Thumbnail, Tokyo Kawaii Travel Collage Poster |
| Editorial + Minimal | Cleaner compositions, structured layouts, quieter art direction | Tri Color Hardcut Portrait Poster, Soft Analog Future Editorial Poster |
| Product + Campaign | Launch ads, product heroes, retail graphics | Sunlit Coastal Product Blitz, Electric Blue Silhouette Product Launch |

## Use a style

1. Pick a style from `docs/CATALOG.md` or `data/catalog.json`.
2. Open `styles/<style-slug>/style.json`, copy the whole JSON into ChatGPT, Claude, Nano Banana Pro, or any LLM image workflow.
3. Fill in the values declared in `environment_variables`, or edit a case in `examples[*].values`.
4. Generate the final image prompt and send it to the image model.
5. Short path: copy the ready-made prompt from `docs/copy-prompts/<style-slug>.md` instead.

## Make a new style

Follow `schemas/style-v2.1.schema.json` (style.json v2.1). Keep the prompt template, the style fidelity anchors, and the source-content-to-avoid list; only change the subject, variables, and palette.
