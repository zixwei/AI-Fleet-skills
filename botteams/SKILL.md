---
name: botteams
description: Use when the user wants a ready-made Grok Bot team or single-bot setup (15 teams, 60 bots from botteams.io / ellelion/botteams): browse teams/ and bots/, pick one, and use its installer prompt.
---
> Source: https://github.com/ellelion/botteams @e478f8d (MIT, see LICENSE.upstream). Installed unmodified on 2026-11-01; upstream README is README.upstream.md.

# botteams: Grok Bot team and bot directory

1. Browse `teams/*.md` (2 to 6 Bots plus a group chat, routines and connectors in the front matter) or `bots/*.md` (one Bot, one job). `status: installable` means ready to run; `status: example` is reference only.
2. Read the chosen file in full. Its front matter lists `bot_roster`, the group chat, routines and connectors; the body holds the role text and the installer prompt.
3. Customize names, connectors and standing instructions for the user, then run the installer prompt. It creates the named Bots and group chat and proposes routines for the user to confirm.
4. To write a new team or bot, copy `docs/examples/sample-team.md` or `sample-bot.md`.
5. `extra-skills/google-keyword-research/` is the repo's own Google Ads keyword skill (needs Google Ads credentials).

Before creating any bot or group chat, follow the user's own standing rules (for zixwei: DECISIONS.md, where creating bots needs his own approval in chat).
