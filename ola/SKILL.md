---
name: ola
description: Use when a number on screen should move smoothly instead of jumping: counters, prices, progress, and live values.
---
来源:https://github.com/franciscop/ola (2026-11-15 ET 核实,stars 1,843,语言 JavaScript,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Ola

## 何时用
屏幕上的数字要平滑变化而不是跳变:计数,价格,进度,实时数值时.

## 安装
```sh
npm install ola  # npm 最新版 1.2.2,2026-11-15 核实
```

## 工作流
1. 把要平滑的数值包成 Ola 值,设好 duration.
2. 数值更新时只改目标值,让库插值到新值.
3. 检查极端值:数值突变很大时是否还平滑,是否要截断或加速.

## 前提与坑
- 只做数值平滑,不做时间线,不做关键帧,复杂动画换 anime.js 或 Motion.
- 数字格式(千分位,小数位)在显示层处理,不要让插值改格式.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
