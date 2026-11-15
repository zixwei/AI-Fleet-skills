---
name: tweenjs
description: Use when sequencing tweens in order: chained animations, delays, calls, and eased property changes, especially in CreateJS projects.
---
来源:https://github.com/CreateJS/TweenJS (2026-11-15 ET 核实,stars 3,560,语言 JavaScript,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# TweenJS

## 何时用
要按顺序动起来的动画:一个接一个,带延迟与回调,配合 CreateJS/EaselJS 用时.

## 安装
```sh
npm install @tweenjs/tween.js  # npm 最新版 25.0.0,2026-11-15 核实;CreateJS 套件另有 @createjs/tweenjs,按项目现状选,不要混装
```

## 工作流
1. 用 Tween 链排顺序:to/wait/call,每步写清目标与时长.
2. 循环与往返要写明次数,避免死循环.
3. 动画中途取消要清掉 Tween,不要残留回调改已卸载的元素.

## 前提与坑
- 有两个同名生态:CreateJS 的 TweenJS 与独立的 @tweenjs/tween.js,先确认项目用的是哪一个,再按对应文档写.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
