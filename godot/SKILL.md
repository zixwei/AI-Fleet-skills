---
name: godot
description: Use when making game animation: 2D/3D games, AnimationPlayer, tweens, cutscenes, and exported games.
---
来源:https://github.com/godotengine/godot (2026-11-15 ET 核实,stars 120,199,语言 C++,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Godot

## 何时用
要做游戏动画:2D/3D 游戏,角色动画,过场,导出可玩版本时.

## 安装
```sh
下载桌面版 Godot 编辑器(官方站 godotengine.org),不要 npm 装;脚本用 GDScript/C#,按官方文档写
```

## 工作流
1. 建场景树:节点,精灵/模型,先静态摆对.
2. 动画:AnimationPlayer 做关键帧,或 Tween 做代码补间,二选一,不要混用同一属性.
3. 预览跑一遍,检查碰撞,镜头,音画同步.
4. 导出:按目标平台导出,先在目标设备上实测.

## 前提与坑
- 是游戏引擎+编辑器,不是 JS 库:动画在编辑器里做,代码只是控制.
- 导出视频要录屏或逐帧渲染,引擎本身出的是可玩游戏,不是 mp4.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
