# stickman-video-director · 火柴人视频导演 Skill

给 Muse 用的火柴人视频生产技能：装上它，Muse 就能自己分场、生成、配音、配乐、剪辑出一条完整的火柴人短片。

An agent skill for making stickman story videos with Muse — scene-by-scene generation, voiceover, BGM and editing, end to end.

## 它做出来的片子

《电梯总停在没人的楼层》58 秒横版故事片：深夜写字楼的电梯每晚自停在封了 6 年的 7 楼，恐怖开局，温暖收尾。全程由 Muse 按本 skill 生产：6 场分场生成 → 中文配音 → 代码合成背景音乐（悬疑转温暖）→ ffmpeg 拼接、字幕、响度归一。

## 核心方法

- **双引擎分工**：A 模型引擎（视频模型分场直出，丝滑、适合成品）/ B 代码引擎（逐帧动画，便宜可控、适合打样），先分清再动手
- **四段式提示词**：固定角色 + 固定画风逐字复用，只换场景与分时动作，角色不漂移
- **长片必须分场**：单条整片只适合 10 秒以内；长片按节拍拆场生成再拼接
- **节奏定版**：配音 0 秒起、文案写满、每场画面变速对齐配音时长、段段首尾相接零静默
- **验收看真片**：抽帧逐场查角色一致性、节拍顺序、接触关系，不过关就返修
- **现代故事风**：精细插画背景 + 大头角色 + 电影感打光，适合恐怖/情感叙事（《电梯》用的就是这套，含返修与配乐全流程记录）

## 安装

把整个文件夹放进你的 Muse skills 目录，例如：

```
~/.claude/skills/stickman-video-director/
```

或你的 agent 框架对应的 custom skills 目录。之后让 Muse 做火柴人视频时，它会自动按 SKILL.md 的规范执行。

## 文件结构

- `SKILL.md` — 主技能文件（菲菲适配版，含实测记录与定版规则）
- `UPSTREAM-SKILL.md` — 上游完整技能原文
- `references/` — A7 提示词契约、验收规范、分镜模板、风格目录等参考文档
- `references/a7-kitchen-ref.jpg` — A7 橡皮管风定身份参考图

## 来源与许可

基于 [kaomei/stickman-video-director](https://github.com/kaomei/stickman-video-director)（MIT）适配，增加了 Muse 本机生产管线、现代故事风分场工作法与多部实测片的返修经验。MIT 许可，见 `LICENSE`。
