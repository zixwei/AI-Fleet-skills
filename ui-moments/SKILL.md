---
name: ui-moments
description: Open-source UI interaction and motion gallery with 232 live examples (52 original controls, 12 click feedbacks, 164 loading animations): browse, copy the standalone HTML or React code, or hand the recreate prompt to an AI coding assistant. Use when the user wants a UI micro-interaction, loading animation, or toggle/switch/slider control for a page or video UI.
---

# UI Moments · 界面图鉴

Source: https://github.com/guanmo-ai/ui-moments @975aba5 (MIT, 1 star, verified 2026-11-20). From the X post "UI 微交互动效合集（第 3 期）" by @guanmo_ai (2026-11-20). This entry is a fleet-written SKILL.md wrapper; the upstream repo has no SKILL.md of its own.

## What it is

An open-source gallery of UI interactions and motion: **232 live examples** you can press, drag, and tune, then take the code away.

| Category | Count | Contents |
| --- | ---: | --- |
| 交互控件 | 52 | Original controls: magnet grid, jelly pad, merge drops, ripple pad, bloom toggle, card fan, depth stack, tilt card, magnetic button, text reveal, menu morph, stagger rows, swipe confirm, pull refresh, elastic string, domino row, rocker switch, scrub wave, snap grid, radial menu, step track, breath orb, stretch toggle, worm dots, rubber search, gooey tabbar, squash play, cart badge, elastic accordion, bulge volume, ink switch, detent dial, hold confirm, odometer stepper, leaf tabs, tide progress, copy morph, like burst, paper plane, download ring, code shake, bell toggle, stroke checklist, pebble rating, notch slider, strength meter, chip input, plan picker, hue orbit, pull cord, flip coin |
| 点击反馈 | 12 | Micron.js bounce, swing, and flick effects |
| 加载动效 | 164 | 27 original, 44 LDRS, 47 Loading UI, 46 SVG Spinners |
| 多彩 | 4 | Day/night switch, color wheel, pull-cord lamp, coin flip (kept in their own group) |

Every card is labeled 原创 (original), 开源集成 (open-source integration), or 参考后实现 (re-implemented after reference); upstream code is kept verbatim with pinned versions, see `CREDITS.md`.

## How to use

1. Open the gallery: the live site is https://guanmo-ai.github.io/ui-moments/ , or open `index.html` / `gallery/` in this directory for the local copy.
2. Find the component by category (交互控件 / 点击反馈 / 加载动效 / 多彩) or by name in `docs/`.
3. Tune it live (size, color, rhythm), then copy the standalone HTML or React example, or copy the component's recreate prompt and hand it to an AI coding assistant to reproduce it.
4. Keep the license note that travels with the code. All components are keyboard reachable, support light/dark themes, and respect reduced-motion preferences; off-screen animations pause automatically.
