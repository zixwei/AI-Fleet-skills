---
name: three-js
description: Use when building 3D scenes on the web: WebGL rendering, cameras, lights, materials, models, and animation loops.
---
来源:https://github.com/mrdoob/three.js (2026-11-15 ET 核实,stars 118,487,语言 JavaScript,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Three.js

## 何时用
要做 3D 场景:WebGL 渲染,相机,光,材质,模型加载,动画循环时.

## 安装
```sh
npm install three  # npm 最新版 0.187.0,2026-11-15 核实
```

## 工作流
1. 搭场景:Scene, Camera, Renderer,光,先出静态画面.
2. 加模型与材质,检查加载路径与跨域.
3. 动画循环 requestAnimationFrame 里改属性,用 Clock 控时间,不要用固定步长.
4. 性能:降面数,合材质,用 instancing,移动端先测帧率.

## 前提与坑
- 默认分支是 dev,看文档以 README 与 releases 为准.
- 版本号高,API 常变,按当前版本文档写,不要凭旧教程写.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
