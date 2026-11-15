---
name: motion
description: Use when adding motion to a web page or React app: transitions, layout animations, gestures, and scroll-linked animation.
---
来源:https://github.com/motiondivision/motion (2026-11-15 ET 核实,stars 35,204,语言 TypeScript,许可证 MIT (LICENSE.md, 2026-11-15 核实)).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Motion

## 何时用
网页或 React 应用里要加动效:页面切换,元素出现/消失,布局变化,手势,滚动联动时.

## 安装
```sh
npm install motion  # npm 最新版 14.14.0,2026-11-15 核实
```

## 工作流
1. 先定动效目的:引导视线,反馈操作,还是过渡衔接,不要为动而动.
2. 选最小实现:简单过渡用 animate,复杂编排用 timeline,列表错峰用 stagger.
3. 设好时长与缓动,保持全站一致,避免每个元素各自动.
4. 真机/浏览器里看一遍,确认低端设备不卡,减弱动效偏好(respect reduced motion)要处理.

## 前提与坑
- 它是动效库,不是视频渲染器:产物是网页动效,不是 mp4.
- 与 React 一起用时按 README 的 React 用法,不要把 DOM 动效与 React 渲染混写.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
