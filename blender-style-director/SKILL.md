---
name: blender-style-director
description: arjun988/blender-skills subset, 58 skills for art direction (style, mood, world, genre, era) plus blender-director orchestration, compositing, and character archetypes, with 5 production pipelines. Complements the EL4CTEO blender-* 28 skills and blender/ without duplication. Use when setting art direction for a Blender asset, when a director must chain multiple skills, or when following a production pipeline.
license: MIT
metadata:
  author: https://github.com/arjun988
  version: "1.0.0"
---
来源:https://github.com/arjun988/blender-skills (2026-11-17 ET 核实, stars 4,064, 许可证 MIT).上游 94 技能,本子集收 58,排除 36,见末节.

# Blender 风格与导演子集

arjun988/blender-skills 的风格 + 导演 + 流水线子集.上游 94 技能全部走 Blender MCP 直接在 Blender 里执行,不用手动 UI 步骤.

## 前提

- Blender 5.2 LTS+,建议 5.3 (与 blender-core 一致).
- 第三方 BlenderMCP 插件 (ahujasid/blender-mcp),见上游 docs/BLENDER_MCP_SETUP.md.没有 MCP 时,按各技能 SKILL.md 里的手动步骤做,但优先接 MCP.
- 任何 Blender 任务先读 blender-core (总入口),按它的路由表分流,再读本条目.

## 分工 (与库里已有 Blender 技能)

- blender-core:任何 Blender 任务的总入口,先读它.它管路由,不管风格.
- 本条目 (blender-style-director):定风格方向 (风格/情绪/世界/类型/年代),blender-director 出 production brief 并串联多技能,5 条生产流水线.
- EL4CTEO blender-* 28 条:技术与基础步骤.建模、雕刻、UV、材质、绑定、动画、导出、渲染、几何节点、模拟等,按 blender-core 路由去对应专技能,不在本子集里.
- blender/:绑定与角色动画执行.本子集的 character-archetypes 只定角色设计方向 (种族、职业、体型),绑定与动画执行仍走 blender/ 与 blender-character-rigging.
- blender-stylized-npr:NPR 着色与描边技术 (卡通着色、描边、Grease Pencil).本子集的 stylized-style 是风格化美术方向 (定风格),两者互补不重复.
- blender-workflow-recipes:EL4CTEO 技能链的端到端 playbook.本子集的 5 条流水线是 arjun988 侧的对应物,技术步骤映射到 EL4CTEO blender-* (见下).

## 收录清单 (58 技能)

上游路径一律为 `.claude/skills/<名字>/SKILL.md` (另有 `.cursor/skills/` 镜像,内容相同).各技能描述见上游 SKILL.md 前言 (name/description/license,均为 MIT).

### 总导演 (1)

- blender-director:任何 Blender 资产任务的起点.分析需求,出 production brief (资产类型、目标平台、美术方向、多边形与贴图预算、导出格式),按流水线顺序激活各专技能,最后跑校验清单.有参考图时先走 references/reference-image-match.md,先写 Reference Analysis 再动手,相机匹配先于微观细节,截图对比循环收尾.

### 核心风格 (8)

- anime-style:动漫与赛璐珞风格,硬色块、卡通着色、干净剪影、动漫比例.
- horror-style:恐怖风格总纲.
- isometric-style:等距视角风格.
- lowpoly-style:低多边形风格.
- psx-horror-style:PSX 恐怖风格 (初代 PlayStation 质感).
- realistic-style:写实风格.
- stylized-style:风格化美术方向 (与 blender-stylized-npr 的 NPR 技术互补,见分工).
- voxel-style:体素风格.

### 扩展风格 (15)

- cartoon-style, chibi-style, comic-book-style, frutiger-aero-style, hand-painted-style, hd-2d-style, manga-style, minimalist-style, noir-style, painterly-style (水彩/油画), pixel-art-style, retro-8bit-style, retro-16bit-style, stop-motion-craft-style, vector-style:卡通、Q 版、漫画、Frutiger Aero、手绘、HD-2D、漫画、极简、黑色电影、油画、水彩、像素、8/16-bit 复古、定格手工、矢量风格.各技能的细分变体见上游 SKILL.md 及其 references/.

### 恐怖包 (8)

- analog-found-footage-horror, body-horror-style, cosmic-eldritch-horror, dream-weirdcore-style, folk-horror-style, indie-horror-aesthetics, liminal-space-style, mascot-puppet-horror:模拟 found footage、身体恐怖、宇宙恐怖、梦核怪异、民间恐怖、独立恐怖美学、阈限空间 (Backrooms)、吉祥物木偶恐怖.恐怖子类型先读对应技能的 references/ (如 Backrooms 在 liminal-space-style 下).

### 世界/主题 (5)

- apocalypse-worlds, biome-worlds, fantasy-worlds, historical-worlds, sci-fi-punk-worlds:末世、生物群落、奇幻、历史、科幻朋克世界 (含蒸汽/柴油/太阳朋克等子类型,见各技能 references/).

### 氛围/情绪 (5)

- brutalist-mood, cozy-wholesome-mood, dark-gritty-mood, dream-surreal-mood, neon-retrofuturism:粗野主义、温馨治愈、黑暗粗粝、梦境超现实、霓虹复古未来主义氛围.

### 游戏类型美术方向 (13)

- genre-action-combat, genre-card-party-idle, genre-metroidvania-roguelike, genre-narrative-vn, genre-open-world-sandbox, genre-puzzle-platformer, genre-racing-sports, genre-rpg, genre-shooter, genre-soulslike, genre-stealth, genre-strategy-sim, genre-survival:动作战斗、卡牌派对休闲、银河恶魔城 Roguelike、视觉小说叙事、开放世界沙盒、解谜平台、竞速运动、RPG、射击、魂系、潜行、策略模拟、生存.每类含可读性规则与子类型,见上游 SKILL.md 及其 references/ (如 FPS/TPS/BR 在 genre-shooter 下).

### 视觉年代 (1)

- visual-console-eras:PS1-PS5、街机、DOS、CRT、VHS、胶片颗粒等视觉年代提示.

### 角色设计参考 (1)

- character-archetypes:角色原型设计方向 (奇幻种族、恐怖生物、职业如骑士/刺客/侦探、体型如机甲/仿生人/Q 版).只定设计方向,绑定与动画执行走 blender/ 与 blender-character-rigging.

### 合成 (1)

- compositing:合成后期 (节点合成、调色、输出).渲染本身走 blender-rendering,合成在这之后.

## 5 条生产流水线

上游 README "Workflow Pipelines" 原样.技术步骤已映射到库内 EL4CTEO blender-* (括号内).风格与导演步骤来自本子集.

1. Hero Hard Surface Prop (硬表面英雄道具): blender-director → hard-surface (blender-hardsurface-modeling) → uv-workflow (blender-retopology-uv) → materials (blender-pbr-materials) → asset-optimization (blender-game-optimization) → export-pipeline (blender-export-pipelines).
2. Game Character (游戏角色): blender-director → character-archetypes (本子集) → character-artist (blender-sculpting) → sculpting (blender-sculpting) → retopology (blender-retopology-uv) → uv-workflow (blender-retopology-uv) → texture-workflow (blender-texturing) → rigging (blender-character-rigging) → animation (blender-animation) → export-pipeline (blender-export-pipelines).
3. Horror Environment (恐怖场景): blender-director → horror-style (本子集) → environment-artist (blender-environment-kits) → lighting (blender-lighting-lookdev) → lowpoly-style (本子集) → asset-optimization (blender-game-optimization) → export-pipeline (blender-export-pipelines).
4. Modular Kit (模块化套件): blender-director → environment-artist (blender-environment-kits) → geometry-nodes (blender-geometry-nodes) → uv-workflow (blender-retopology-uv) → texture-workflow (blender-texturing) → asset-optimization (blender-game-optimization) → export-pipeline (blender-export-pipelines).
5. Reference Image Match (参考图匹配): blender-director → references/reference-image-match.md → Reference Analysis (references/reference-analysis-template.md) → Camera match → Geometry tiers → materials (blender-pbr-materials) → lighting (blender-lighting-lookdev) → 截图对比循环 → visual-match-checklist → validation-checklist.

## 上游共享参考文件

上游 `.claude/skills/references/`: asset-pipeline.md (通用管线), reference-image-match.md, reference-analysis-template.md, visual-match-checklist.md, validation-checklist.md, mcp-integration.md, naming-conventions.md, polycount-budgets.md.

## 未收录 (36 技能) 及原因

- 与 EL4CTEO blender-* 重复的基础与技术技能 (33): blender-modeler、hard-surface、prop-artist、vehicle-artist、environment-artist、vegetation-artist、character-artist、creature-artist、sculpting、retopology、uv-workflow、materials、texture-workflow、hair-groom、cloth-sim、lookdev、geometry-nodes、lighting、camera-cinematography、rendering、animation、rigging、physics-sim、procedural-modeling、scene-assembly、set-dressing、asset-optimization、lod-pipeline、export-pipeline、unity-export、unreal-export、godot-export、qa-review.库内已有同方向的深方法版 (如 blender-hardsurface-modeling、blender-sculpting、blender-retopology-uv、blender-pbr-materials、blender-character-rigging、blender-animation、blender-export-pipelines、blender-asset-qa、blender-game-optimization),不重复收.
- 与 EL4CTEO 同方向 (1): vfx-fx (与 blender-simulation、blender-weather-fx 同方向).
- 不在本次子集范围内 (2): archviz (建筑可视化垂直方向)、collision-proxy (引擎导出前置技术步骤,blender-export-pipelines 已覆盖导出流程).如需可单评.
