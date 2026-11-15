---
name: shifty
description: Use when tweening values with easing: smooth interpolation between numbers, colors, and object properties in JS/TS.
---
来源:https://github.com/jeremyckahn/shifty (2026-11-15 ET 核实,stars 1,578,语言 TypeScript,许可证 MIT (package.json license 字段, 2026-11-15 核实)).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Shifty

## 何时用
要做缓动与补间:数值,颜色,对象属性从 A 平滑变到 B,要多种 easing 可选时.

## 安装
```sh
npm install shifty  # npm 最新版 3.0.9,2026-11-15 核实
```

## 工作流
1. 定起点,终点,时长与 easing.
2. 每帧把插值写回目标属性,不要在插值里做重计算.
3. 可中断:新目标到来时取消旧补间,直接从当前值开始.

## 前提与坑
- 只做补间引擎,不做时间线编排与 DOM 操作,复杂编排换 anime.js 或 Motion.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
