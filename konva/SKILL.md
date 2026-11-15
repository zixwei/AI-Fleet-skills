---
name: konva
description: Use when building interactive canvas graphics: design editors, whiteboards, diagrams, and touch-friendly canvas apps.
---
来源:https://github.com/konvajs/konva (2026-11-15 ET 核实,stars 14,973,语言 TypeScript,许可证 未核实(API 返回 NOASSERTION,见仓库 LICENSE 文件)).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Konva

## 何时用
要做可触摸交互的画布:设计编辑器,白板,图表,要拖拽,缩放,选中,分层时.

## 安装
```sh
npm install konva  # npm 最新版 10.9.1,2026-11-15 核实;React 项目另装 react-konva,按 README 为准
```

## 工作流
1. 建 Stage -> Layer -> Shape 层级,先静态画对.
2. 加交互:拖拽,选中,缩放,变换,每步只改对应节点.
3. 动画用 Konva.Tween 或 requestAnimationFrame,重绘只重画改动的层.
4. 导出:toDataURL 出图,或录屏出视频.

## 前提与坑
- 画布交互要处理触摸与鼠标两套事件,真机先测.
- 节点一多就分层,不要全放一个 Layer 里重绘.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
