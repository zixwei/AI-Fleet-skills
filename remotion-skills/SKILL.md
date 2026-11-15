---
name: remotion-skills
description: Use when making a video with Remotion in React: create a composition, write markup, preview in Studio, render to video or still. Install the official Remotion Agent Skills first, then follow them.
---
来源:https://github.com/remotion-dev/skills (2026-11-15 ET 核实,stars 7,213,语言 TypeScript,许可证 未核实(仓库根目录无 LICENSE 文件,见 remotion 主仓)).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Remotion Skills

## 何时用
做动画视频,特别是 YPP 这类口播/图表视频,要用 React 代码生成视频并渲染导出时.

## 安装
```sh
npx skills add remotion-dev/skills
# 或 gh skill install remotion-dev/skills
# 新项目: bun create video
```

## 子技能(上游 README 列出,2026-11-15 核实)
- `/remotion-best-practices`:不确定用哪个子技能时先用它,它涵盖其余技能.
- `/remotion-create`:新建 Remotion 项目或 composition.
- `/remotion-markup`:写 Remotion React markup,含 composition,动画,排版,媒体,音频,字体,时间.
- `/remotion-studio`:启动 Studio 预览视频.
- `/remotion-render`:渲染成视频或静帧.
- `/remotion-maps`:地图动画,路线,标记,地理讲解.
- `/remotion-captions`:字幕.
- `/remotion-saas`:把 Remotion 做成 SaaS/产品集成时的架构.
- `/remotion-interactivity`:让 Studio 里的元素可选中可编辑.
- `/remotion-docs`:查 Remotion 文档,取任意页面为 Markdown,写代码前先查 API 与组件 props.
- `/remotion-license`:许可证信息与购买.
- `/remotion-upgrade`:升级 Remotion,相关包与已装技能.
- `/remotion-multimedia`:浏览器端多媒体处理(Mediabunny),取视频/音频元数据.

## 工作流
1. 先装技能,再按子技能顺序走: create -> markup -> studio 预览 -> render.
2. 写代码前用 `/remotion-docs` 查当前 API,不要凭记忆写 props.
3. 预览确认画面,字幕,音频对齐后再渲染.

## 前提与坑
- 渲染依赖无头浏览器与 ffmpeg,先确认本机有 Chromium 与 ffmpeg,缺了先装,否则会在渲染步卡住(帖子评论 @hppzyy 2026-11-15 指出).
- Remotion 许可证:商业使用先看 `/remotion-license`,不要默认免费可商用.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
