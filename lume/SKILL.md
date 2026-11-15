---
name: lume
description: Use when building 3D scenes with HTML: 3D elements as HTML tags, CSS-like styling, and WebGL rendering in the browser.
---
来源:https://github.com/lume/lume (2026-11-15 ET 核实,stars 1,549,语言 TypeScript,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# LUME

## 何时用
要用 HTML 做 3D 场景:把 3D 元素写成 HTML 标签,要 CSS 式布局,要在浏览器里看 3D 时.

## 安装
```sh
npm install @lume/element  # npm 最新版 0.17.1,2026-11-15 核实;完整 3D 元素包名按 README 为准
```

## 工作流
1. 先搭场景:相机,光,3D 元素,先静态摆对位置再加动画.
2. 动画改属性(位置,旋转,大小),用 CSS/JS 控制,保持帧率.
3. 移动端先测性能,重场景降面数,降阴影.

## 前提与坑
- 产物是网页 3D,不是视频文件;要出视频需录屏或逐帧渲染.
- 版本较新,API 变动快,按当前 README 写.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
