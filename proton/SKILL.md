---
name: proton
description: Use when adding particle effects: emitters, behaviors, sparks, smoke, fire, and other particle animation on canvas/WebGL.
---
来源:https://github.com/drawcall/Proton (2026-11-15 ET 核实,stars 2,509,语言 JavaScript,许可证 MIT).帖子来源:https://x.com/feljoy_ix/status/2121787138455040333 (@Feljoy_ix,2026-11-14 21:07 ET).

> 注意:上游仓库本身是库/工具,不是原生 Agent Skill(除 remotion-skills 外).本文件是舰队包装技能:先读上游 README,再按下面流程动手.不要凭记忆编 API,示例以 README 为准.

# Proton

## 何时用
要做粒子:发射器,行为,火花,烟,火,爆炸等粒子动效时.

## 安装
```sh
npm install proton-js  # npm 最新版 3.1.2,2026-11-15 核实;包名与 import 以 README 为准
```

## 工作流
1. 定粒子效果目标:什么粒子,从哪发,往哪飞,活多久.
2. 建 Emitter + Rate + Behaviour,先小量测效果再放大.
3. 性能:粒子数先测帧率,移动端减半,超量会卡.
4. 与主动画同步:粒子开始/结束与主时间轴对齐.

## 前提与坑
- 只做粒子,不做时间线与场景管理,主动画另用别的技能.
- 效果依赖随机参数,交付前固定种子或录多遍挑一遍,不要每次结果都不一样.

## 流水线位置
帖子原话:从指示->制作->动起来->修改->导出,整个流程都有对应的工具.本技能在流水线里的位置见上文;单个工具不包全流程,缺的环节另选技能补.

## 验收
- 画面/动效在目标设备上实播一遍,无跳变,无截断,无卡顿.
- 导出文件核对:格式,分辨率,帧率,时长,体积.
- 失败先看上游 README 与 issues,不要凭猜改 API.
