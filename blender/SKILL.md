---
name: blender
description: Use when doing rigging and character animation: 3D characters, rigs, keyframes, and rendered animation in Blender.
---
来源:https://github.com/blender/blender (2026-11-15 ET 核实,stars 22,030,语言 C++,许可证 未核实(API 返回 NOASSERTION,见仓库 LICENSE 文件)).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Blender

## 何时用
要做绑定与角色动画:3D 角色,骨骼绑定,关键帧动画,要渲染成视频时.

## 安装
```sh
下载桌面版 Blender(官方站 blender.org),不要 npm 装;自动化用 Blender 自带 Python(bpy)脚本,按官方手册写
```

## 工作流
1. 建模/绑定:骨骼,权重,控制器,先摆 T-pose 检查.
2. 关键帧:姿态,表情,镜头,按时间轴排.
3. 低采样预览渲染,确认动作与镜头无误.
4. 正式渲染:设分辨率,帧率,输出格式,分段渲染防中断.

## 前提与坑
- 是桌面软件,不是 JS 库:没有 npm 包,不要在代码项目里 import 它.
- 渲染吃 GPU/CPU,长片先算时间,分段渲,留断点续渲.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
