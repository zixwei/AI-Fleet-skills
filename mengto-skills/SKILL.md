---
name: mengto-skills
description: Meng To 的 agent 技能合集 (195 个):网页设计、3D、插画、游戏开发与战斗特效、媒体、UI、视频剪辑、Codex 工作流. Use when designing or building web pages, 3D scenes, illustrations, game effects, or media with an AI coding agent, or when a design needs a named style/pattern rather than the generic default.
license: MIT
metadata:
  author: https://github.com/MengTo
  version: "2026-11-19"
---

来源:https://github.com/MengTo/Skills (2026-11-19 ET 核实,上游提交 375251af,7,773 stars,许可证 MIT).X @wuyi_ai 2026-11-19 帖子推荐,用户 2026-11-19 22:05 ET 下令入库.

# MengTo Skills:设计师出品的 agent 技能合集

设计师 Meng To 给 Codex、Claude、Cursor 等 AI 编程 agent 写的技能合集,共 195 个技能,分 9 类.特点是重参考、重判断:每个技能给一个具体方向 (某种风格、某种动效、某种页面结构),让 AI 照着做,而不是自由发挥出平均脸.

## 分类一览

| 分类 | 数量 | 内容举例 |
|---|---|---|
| web-design | 97 | 网页设计:滚动叙事、GSAP 动效、玻璃拟态、新古典账本、赛博暗色、编辑排版、定价页、落地页等 |
| 3d | 21 | 3D:布料/金属/木材/纸材质、水面、天空、虚拟漫游、超写实水体、神光 |
| game-development | 21 | 游戏开发:关卡、音效、镜头、背包、地图编辑器、怪物系统、三维敌人、动作战斗 |
| codex | 20 | Codex 工作流:提示词转技能、参考图原创度审计、灵感站、TTS、视频转提示词 |
| illustration | 14 | 插画风格:波普、扁平、钢笔、颗粒水粉、半调线条、单线、双色笔刷、复古徽章 |
| media | 7 | 媒体:AI 形象、数字分身、HTML 讲解视频、短视频、Unsplash 素材 |
| game-combat | 6 | 战斗特效:火焰烟雾、冰霜、闪电能量、水晶、战斗动画打磨 |
| workflow | 4 | 工作流:进度截图、打分到目标、发版、线程管理 |
| ui | 3 | UI:审计 AI 设计味、设计优先提示词、去 AI 设计味 |

各分类另有 README (如 `agent-skills/web-design/WEB-DESIGN-SKILLS.md` 为网页设计类总览).

## 怎么用

1. 按任务先定分类,再读 `agent-skills/<分类>/<技能名>/SKILL.md`;不要一次全读,195 个技能只读当次要用的一个.
2. 网页设计类先读 `agent-skills/web-design/WEB-DESIGN-SKILLS.md` 总览,再挑具体技能.
3. 技能正文按 Codex、Claude、Cursor 写,其他 AI 照方法用,跳过平台专属步骤.
4. `agent-skills/codex/` 下的技能面向 Codex 工作流 (提示词、审计、发布),用 Codex 之外照方法取舍.
5. `scripts/` 是上游配套脚本,`assets/runtime/` 是演示页共用的 JS 运行库 (GSAP、Three.js 等压缩版).

## 未入库说明

- 各技能的 `demo/` 目录未入库 (约 144MB:演示截图、演示视频与自包含演示页).演示是上游的示例产出,不是方法本身;要看效果去上游仓库 `MengTo/Skills` 对应技能的 `demo/` 目录.
- 上游根目录的 `SCREENSHOTS.html` / `SCREENSHOTS.md` / `SCREENSHOTS-preview.jpg` (截图画廊) 未入库.
- 其余全部入库:195 个技能正文、REFERENCES、agents 配置、scripts、`assets/runtime/`、`DEMOS.md`、`CLAUDE.md`.
