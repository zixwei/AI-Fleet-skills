---
name: video-recap-skills
description: Video skills from zenstory-ai/video-recap-skills (内容理解), 2 skill(s) kept from the 2026-11-19 X video-skills roundup by @Tynric_carter.
---

# video-recap-skills

Source: https://github.com/zenstory-ai/video-recap-skills @7a5a5aa (MIT, 645 stars, verified 2026-11-20). Video skills from the X video-skills roundup (2026-11-19, @Tynric_carter).

## Sub-skills

- `video-recap`: 把一段或多集视频做成带画框字幕的中文解说成片或纯原声高光短片。用户提供 .mp4 / .mov / .mkv / .webm，要求做影视解说、短剧二创、加旁白配音、跨集混剪或导出剪映草稿时使用；串联完成看片识台词、定主线与留原声、按台词停顿切镜头、写词检查、TTS 配音与混音加字幕。触发词：视频解说、影视解说、视频旁白 See `skills/video-recap/SKILL.md`.
- `video-reference`: 按需把一部优秀成片拆成可复用的制作参考：实测镜头节奏与音量起伏，标注段落与声音分工，把原片剧情事实与通用剪辑手法分开，导出不含原片人名和台词的 production_reference.json 供下次做片参考。独立于日常做片流程。触发词：拆片、拆解成片、制作参考、参考模板、production reference。 See `skills/video-reference/SKILL.md`.

## How to use
1. Pick the sub-skill; read its `SKILL.md` in this skill directory and follow it, including files it references.
