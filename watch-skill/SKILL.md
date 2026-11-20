---
name: watch-skill
description: Video skills from oxbshw/watch-skill (内容理解), 10 skill(s) kept from the 2026-11-19 X video-skills roundup by @Tynric_carter.
---

# watch-skill

Source: https://github.com/oxbshw/watch-skill @f1317c8 (MIT, 597 stars, verified 2026-11-20). Video skills from the X video-skills roundup (2026-11-19, @Tynric_carter).

## Sub-skills

- `asking-with-evidence`: The user asks a question about a video that was already watched or indexed — "what did they say about X", "what error code appears", "what happens at 2:30", "do See `skills/asking-with-evidence/SKILL.md`.
- `configuring-vision`: The user wants to connect an LLM or vision provider, already has an API key, asks "can I use OpenAI/Anthropic/Gemini/OpenRouter", wants local Ollama, or needs d See `skills/configuring-vision/SKILL.md`.
- `extracting-structure`: The user wants structure pulled out of a watched video — "make chapters for this video", "where does the bug appear in this recording", "turn this screen record See `skills/extracting-structure/SKILL.md`.
- `learning-from-mistakes`: The user corrected an answer about a video — "no, it actually says X", "that's the wrong timestamp", "you misread the error code" — or asks why a video answer w See `skills/learning-from-mistakes/SKILL.md`.
- `recovering-from-errors`: A Watch Skill command failed, video download broke, ffmpeg or yt-dlp is missing, a provider returned an error, local vision stopped, or the user asks "why can't See `skills/recovering-from-errors/SKILL.md`.
- `sharing-results`: The user wants to share or hand off what was found in a video — "send this analysis to my team", "make a page I can share", "export the findings", "give me some See `skills/sharing-results/SKILL.md`.
- `the-loop`: The user built or changed something visual — a UI, an animation, a game, a generated video — and wants it verified, or asks "why does my UI look wrong", "check See `skills/the-loop/SKILL.md`.
- `video-memory`: The user asks about videos watched in the past or across sessions — "have we watched anything about X", "which video showed that error", "what did that meeting See `skills/video-memory/SKILL.md`.
- `watch`: Watch any video (URL, stream, or local path) via Watch Skill. Downloads, extracts scene-aware deduped frames, OCRs them, transcribes (captions first, then local See `skills/watch/SKILL.md`.
- `watching-videos`: The user shared a video URL, a YouTube/TikTok/stream link, a local video file, a screen recording, a meeting recording, or a playlist/folder of videos — "watch See `skills/watching-videos/SKILL.md`.

## How to use
1. Pick the sub-skill; read its `SKILL.md` in this skill directory and follow it, including files it references.
