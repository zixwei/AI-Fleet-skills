---
name: babylon-js
description: Use when building 3D rendering and animation on the web: scenes, cameras, lights, materials, physics, and game-like 3D apps.
---
来源:https://github.com/BabylonJS/Babylon.js (2026-11-15 ET 核实,stars 26,368,语言 TypeScript,许可证 Apache-2.0).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Babylon.js

## 何时用
要做 3D 渲染与动画:网页 3D,游戏类 3D 应用,要物理,要编辑器辅助时.

## 安装
```sh
npm install @babylonjs/core  # npm 最新版 9.36.0,2026-11-15 核实;完整包列表按 README 为准
```

## 工作流
1. 搭场景:Engine, Scene, Camera,光,先出静态画面.
2. 加网格,材质,动画(Animation/关键帧),检查加载与跨域.
3. 动画循环里更新,性能先测,重场景降面数,降阴影.
4. 要出视频需录屏或逐帧渲染,引擎本身出的是交互 3D.

## 前提与坑
- 包多(@babylonjs/core, loaders, materials 等),只装要用的,不要全装.
- 许可证 Apache-2.0,商用按许可证要求留声明.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
