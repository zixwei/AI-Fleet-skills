---
name: pixelfx
description: Make pixel art effects and sprite animations in code with the pixelfx library (264 ready-made effects), recolor, export as sprite sheets or remix. Use when someone wants pixel art VFX, sprite animations or sprite sheets for a game.
license: MIT
---
来源:https://github.com/patch-gg/pixelfx (2026-11-19 ET 核实,上游提交 5294518,8,349 stars,许可证 MIT).X @BeyondTheBoxCN 2026-11-19 帖子推荐,用户 2026-11-19 下令入库.

# pixelfx 像素特效与 sprite 动画

用 JS 代码做像素特效:每个特效是一个文件 `src/fx/<分类>/<名字>.js`,画进 color(像素)与 light(叠加辉光)两个缓冲,无图片,可直播、可改色、可镜像、可换种子、可渲染成 Sprite Sheet 给任何引擎.特效按角色演出组织(蓄力、命中冻结、恢复),覆盖火、爆炸、水、冰、雷、科幻、近战、冲击、投射、生成与死亡、奥术、神圣、暗影、状态、自然、天气、UI、拾取、过渡、生物.

## 数字说明

实测 `src/fx/` 有 264 个特效文件(21 类),`docs/CATALOG.md` 亦列 264 条;上游 SKILL.md 正文写 244,是旧数,以实测 264 为准.

## 前提

- Node 18+;ffmpeg 可选(GIF 与 MP4 预览).
- 在本目录工作(已是完整 checkout):工具只用 Node,无需安装.

## 怎么用

1. 先找现成特效:`node tools/list.mjs <关键词>` 按 id、名字、标签、描述搜;`docs/CATALOG.md` 按分类列出全部.
2. 渲染候选再挑:`node tools/render.mjs fire/torch` 写出 contact sheet,看图再定.多数需求是现成特效换参数:`palette`(主色阶)、`seed`、`flip`、`angle`、`light` 及各特效自有的 `meta.options`.
3. 做新特效按 `skills/pixelfx/SKILL.md` 的 draft、render、look、refine 循环:先出草稿、渲染、看图、再改,不要一次提示词出图.
4. 进游戏:导出 Sprite Sheet,用 Godot、Unity、Phaser 或 canvas 游戏.

## 收录清单
- [pixelfx](skills/pixelfx/SKILL.md):Make pixel art effects and sprite animations in code with the pixelfx library, which has 244 ready-made ones, acted out by a character who winds up, freezes on contact and recovers, to drop into a game, recolor, export as sprite sheets or remix, plus a draft, render, look, refine loop that makes new ones look hand-animated.(正文 244 为旧数,实测 264,见上.)
- 引擎:`src/fx/` 264 个特效 + `src/core/` 核心;`tools/` 渲染与搜索脚本;`docs/CATALOG.md` 全目录;`gallery/` 画廊页.

## 未入库说明

- `docs/readme/acts.gif`、`montage.gif` 两张演示 gif(约 11.2MB)与 `gallery/fonts/PatchPixel-Regular.woff2` 字体未入;看效果图去上游.
