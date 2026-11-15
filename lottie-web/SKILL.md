---
name: lottie-web
description: Use when playing lightweight vector animations on the web: After Effects animations exported as JSON, played in SVG, Canvas, or HTML.
---
来源:https://github.com/airbnb/lottie-web (2026-11-15 ET 核实,stars 32,455,语言 JavaScript,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Lottie Web

## 何时用
要播轻量矢量动画:After Effects 导出的 JSON 动画,要在网页/App 里播,要小体积可缩放时.

## 安装
```sh
npm install lottie-web  # npm 最新版 5.13.0,2026-11-15 核实
```

## 工作流
1. 在 After Effects 里做好动画,用 Bodymovin 导出 JSON,确认 JSON 里无外部图片依赖(或一并带上).
2. 用 loadAnimation 挂到容器,选 renderer:svg/canvas/html,设 loop 与 autoplay.
3. 控制播放:play/pause,跳帧,变速,按交互触发.
4. 检查体积与首屏:大 JSON 先懒加载,不要阻塞首屏.

## 前提与坑
- 只做播放,不做制作:动画本身要在 After Effects 里做.
- 不是所有 AE 特效都能导出,导出后先在网页里实播一遍再交付.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
