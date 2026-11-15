---
name: motion-canvas
description: Use when making explanatory animations with code: diagrams, math, code walkthroughs, and animated explainers rendered as video.
---
来源:https://github.com/motion-canvas/motion-canvas (2026-11-15 ET 核实,stars 19,919,语言 TypeScript,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Motion Canvas

## 何时用
要做图解动画,讲清楚一个概念,公式,流程或代码逻辑,要逐帧可控,可复现时.

## 安装
```sh
npm install @motion-canvas/core @motion-canvas/2d @motion-canvas/ui  # 按上游 README 的当前安装命令为准
# 或用官方脚手架新建项目,见 README
```

## 工作流
1. 明确要讲的概念与分镜:每段讲什么,画面上出现什么.
2. 用代码写场景:图形,文字,箭头,高亮,按时间轴出现/消失/移动.
3. 本地预览,逐段检查节奏与文字可读性.
4. 渲染导出视频,检查成品逐帧无跳变,无文字截断.

## 前提与坑
- 用代码做动画,不是拖时间轴:改动画就是改代码,版本可控,但上手要会 TypeScript.
- 导出前确认分辨率,帧率与时长,不要渲染完才发现比例不对.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
