---
name: two-js
description: Use when drawing 2D vector animation on the web: shapes, paths, and scenes rendered to SVG, Canvas, or WebGL.
---
来源:https://github.com/jonobr1/two.js (2026-11-15 ET 核实,stars 8,736,语言 JavaScript,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Two.js

## 何时用
要做 2D 矢量动画:图形,路径,场景,要在 SVG/Canvas/WebGL 之间换渲染器时.

## 安装
```sh
npm install two.js  # npm 最新版 0.8.24,2026-11-15 核实
```

## 工作流
1. 选渲染器:SVG 易调试可交互,Canvas 性能好,WebGL 做重图形.
2. 建场景:形状,分组,层级,先静态画对,再加动画.
3. 动画循环里只改属性,不重建形状.
4. 导出:录屏或逐帧截图再合成视频,库本身不直接出 mp4.

## 前提与坑
- 默认分支是 dev,看文档以 README 与 releases 为准,不要默认 main.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
