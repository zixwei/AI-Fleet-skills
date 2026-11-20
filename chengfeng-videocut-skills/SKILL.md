---
name: chengfeng-videocut-skills
description: Video skills from Agentchengfeng/chengfeng-videocut-skills (剪辑执行), 7 skill(s) kept from the 2026-11-19 X video-skills roundup by @Tynric_carter.
---

# chengfeng-videocut-skills

Source: https://github.com/Agentchengfeng/chengfeng-videocut-skills @a33b43e (Apache-2.0, 3249 stars, verified 2026-11-20). Video skills from the X video-skills roundup (2026-11-19, @Tynric_carter).

Plugin distribution shell; requires Codex CLI plus the chengfeng runtime per upstream README.

## Sub-skills

- `chengfeng-cut`: 剪辑中文口播原素材：逐词转录、词典修字出修字表、五轮扫描找口误与重复、汇总表与重复句子表、打开 Studio 让用户复核、复盘沉淀用户偏好与词典。只产出一份已复核的删词账本，不切媒体、不做字幕、不做分镜动画。用户说剪口播、处理口误、生成口播基础素材、继续剪口播，或确认卡回传 action=return_cut_revi See `plugins/chengfeng-videocut/skills/chengfeng-cut/SKILL.md`.
- `chengfeng-subtitle`: 给剪好的口播做字幕：直接用已有的逐词稿加账本算出剪后时间（不必导出、不必重新转录）、用词典和作者文稿改写听错的专名、按句子分屏、在 Studio 里逐屏复核。用户说做字幕、加字幕、改字幕、重新分屏、字幕不对时使用。不要用于删词剪辑、物理剪切、分镜动画或成片渲染。 See `plugins/chengfeng-videocut/skills/chengfeng-subtitle/SKILL.md`.
- `chengfeng-export`: 把剪好的口播烧成一个成片文件：账本切片段、推近、字幕、HTML 画面层，一次全部烧进 mp4。用户说导出、出成片、烧字幕、渲染、导出视频、生成最终文件时使用。不要用于生成删词候选、写字幕、做画面动画。 See `plugins/chengfeng-videocut/skills/chengfeng-export/SKILL.md`.
- `chengfeng-visual`: 给剪好的口播配画面：在录屏上盖 HTML 层（圈重点标注 / 小黑整屏动画 / 推近），层绑字幕屏、由播放器逐帧驱动、直接在预览里看。用户说做分镜、配画面、加动画、圈重点、B-roll、做 storyboard 时使用。不要用于删词剪辑、字幕、物理剪切或成片渲染。 See `plugins/chengfeng-videocut/skills/chengfeng-visual/SKILL.md`.
- `chengfeng-videocut-workbench`: 操作 chengfeng-videocut 剪辑工作台的已有工程，通过 Runtime CLI 查工程与词句位置、添加或替换画面覆盖层、移除画面、删除明确指定的词句或片段、拆分裁剪移动已有片段、调整画布比例并回读核验。用户说插入片段、删掉这句、移除动画、换个画面、调整顺序或管理时间线时使用；先区分画面覆盖与主轨顺延插入 See `plugins/chengfeng-videocut/skills/chengfeng-videocut-workbench/SKILL.md`.
- `chengfeng-check-updates`: 剪辑环境的唯一管理者：就绪检查（skills 是否最新 → Runtime 是否配套）、Skills 更新激活、Runtime 安装与体检。用户说检查更新、安装剪辑环境、装播放器、检查剪辑环境、剪辑环境就绪了吗、配置转录凭证时使用；业务 Skill（剪口播/字幕/画面/导出）第 0 步也引用本 Skill 的就绪检查。 See `plugins/chengfeng-videocut/skills/chengfeng-check-updates/SKILL.md`.
- `chengfeng-report-bug`: 整理、脱敏并上报 chengfeng-videocut 的 GitHub Bug。用户说上报 Bug、反馈剪口播问题、提交 GitHub Issue、这个问题告诉开发者，或要求继续提交已预览的 Bug 草稿时使用。不要用于功能建议、普通排错、代码提交或未获用户确认的自动上报。 See `plugins/chengfeng-videocut/skills/chengfeng-report-bug/SKILL.md`.

## How to use
1. Pick the sub-skill; read its `SKILL.md` in this skill directory and follow it, including files it references.
