---
name: gifenc
description: Use when exporting GIFs from code: fast GIF encoding from frames, pixels, or canvas in JS.
---
来源:https://github.com/mattdesl/gifenc (2026-11-15 ET 核实,stars 363,语言 JavaScript,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# gifenc

## 何时用
要导出 GIF:把帧,像素或 Canvas 画面编码成 GIF,要快,要在浏览器或 Node 里跑时.

## 安装
```sh
npm install gifenc  # npm 最新版 1.0.3,2026-11-15 核实
```

## 工作流
1. 准备帧:每帧是像素数据或 Canvas,尺寸统一.
2. 设好宽高,帧率/延迟,循环次数,调色板(quantize).
3. 编码后检查:体积,颜色断层,循环点是否跳帧.
4. 大 GIF 先降尺寸/帧率/颜色数,不要直接出几十 MB 的文件.

## 前提与坑
- 只做 GIF 编码,不做动画制作:帧要先由别的工具画出来.
- GIF 只支持 256 色,渐变与照片类画面会断层,先确认效果可接受.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
