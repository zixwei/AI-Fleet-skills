---
name: digital-human-koubo-comfyui
description: Video skills from walkskysu/digital-human-koubo-comfyui (数字人), 2 skill(s) kept from the 2026-11-19 X video-skills roundup by @Tynric_carter.
---

# digital-human-koubo-comfyui

Source: https://github.com/walkskysu/digital-human-koubo-comfyui @020701a (MIT, 37 stars, verified 2026-11-20). Video skills from the X video-skills roundup (2026-11-19, @Tynric_carter).

ComfyUI variant of digital-human-koubo.

## Sub-skills

- `digital-human-koubo`: 用固定的数字人形象（白背心数字人 / 用户本人数字人 / 猫狗角色）做口播视频。生成有两条路线：本地 ComfyUI（Qwen3-TTS 克隆配音 → MiniMax H3 照着配音对口型，Qwen Image 场景图、Music 3 配乐，不花积分；检测到 127.0.0.1:8188 就默认走本地）或云端 Reno See `skills/digital-human-koubo/SKILL.md`.
- `finance-explainer`: 「小Lin说」式财经/科技解说视频工作室：选题打分 → 带出处的事实清单（Exa/Tavily/Serper/Firecrawl）→ 按危机型/收购战型/悖论型骨架写有活人感的口播剧本（拍表 episode.json）→ 主播自录音频对齐跳切（或 MiMo 占位）→ 原创数字人出镜（Renoise：Wan 3.0 音频 See `skills/finance-explainer/SKILL.md`.

## How to use
1. Pick the sub-skill; read its `SKILL.md` in this skill directory and follow it, including files it references.
