---
name: anime-js
description: Use when animating DOM, SVG, CSS, or JS objects on a timeline: staggered entrances, chained sequences, and eased property animation.
---
来源:https://github.com/juliangarnier/anime (2026-11-15 ET 核实,stars 74,717,语言 JavaScript,许可证 未核实).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Anime.js

## 何时用
要做时间线动画与错峰动效:元素依次出现,属性按顺序变,SVG/CSS/JS 对象一起动时.

## 安装
```sh
npm install animejs  # npm 最新版 4.5.0,2026-11-15 核实;包名与 import 写法以 README 为准
```

## 工作流
1. 明确目标与属性:改什么元素的什么属性,起止值是多少.
2. 用 timeline 排顺序,用 stagger 做错峰,用 easing 控节奏.
3. 动画结束要收尾:回调里改状态,不要让元素停在中间态.
4. 循环/往返动画先确认停止条件,避免无限循环占 CPU.

## 前提与坑
- 4.x 与 3.x 的 import 与 API 有变化,按当前 README 写,不要凭旧记忆写.
- 产物是网页动效,不是视频文件.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
