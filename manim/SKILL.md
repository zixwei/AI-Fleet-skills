---
name: manim
description: Use when animating math formulas and graphics with Python: explanatory math videos, formula derivations, and precise geometric animation.
---
来源:https://github.com/ManimCommunity/manim (2026-11-15 ET 核实,stars 42,554,语言 Python,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Manim

## 何时用
要做公式与图形动画,数学讲解视频,推导过程一步步出现时.

## 安装
```sh
pip install manim  # PyPI 最新版 0.22.1,2026-11-15 核实;另需 ffmpeg 与 LaTeX(公式渲染用),按官方安装指南装
```

## 工作流
1. 写 Scene 类:公式,图形,文字按步骤出现,变换,消失.
2. 先低画质快速渲染检查(-pql),确认无误再高画质渲染.
3. 检查公式渲染:LaTeX 有无报错,符号有无缺失.
4. 导出视频,核对时长与配音/字幕对齐.

## 前提与坑
- 依赖较重:Python, ffmpeg, LaTeX,先按官方指南装好再写 Scene.
- 渲染慢,长视频先分段渲染再拼接,不要一次渲全片等报错.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
