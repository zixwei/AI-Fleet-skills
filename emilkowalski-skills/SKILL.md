---
name: emilkowalski-skills
description: Emil Kowalski 的设计与动效技能集 (20 个):从零做动画,编排多元素动效,手势交互,动效评审与审计,苹果式设计,去多余动效,移动端原生感,选 UI 库,做原型,写 Swift. Use when building, reviewing, or fixing UI animation, motion, gestures, or interface polish on web, React Native/Expo, or Swift.
license: MIT
metadata:
  author: https://github.com/emilkowalski
  version: "2026-11-15"
---

来源:https://github.com/emilkowalski/skills (2026-11-19 ET 核实,上游提交 64eb3deb,58,211 stars,许可证 MIT).X @wuyi_ai 2026-11-19 帖子推荐,用户 2026-11-19 22:05 ET 下令入库.

# Emil Kowalski Skills:设计师与工程师的动效技能集

Emil Kowalski (Vercel, Linear) 的动效与界面打磨技能,共 20 个.核心思想:动效不是装饰,是判断——该不该动、动什么、用什么曲线、多久、怎么打断、怎么退场,按这个顺序决策.先读 `UPSTREAM-README.md` 了解全貌,再按任务读 `skills/<名字>/SKILL.md`.

## 技能一览

| 技能 | 干什么 |
|---|---|
| animate | 从零做一个动画:该不该动、目的、工具、属性、曲线时长、打断、退场,写出实现 |
| animate-expo | React Native / Expo 里的动画:线程、属性、spring/timing、手势交接、降级,Reanimated + Gesture Handler |
| animation-performance | 动效性能:只动复合属性、别占主线程、掉帧找原因;卡顿时用 |
| animation-vocabulary | 动效反查词典:把含糊描述 ("弹出来的那个东西") 译成准确术语 |
| apple-design | 苹果式界面与物理动效,转译到 Web:手势、弹簧、可打断过渡、半透明材质、字体 |
| ask-emil | 路由器:不知道用哪个技能时先问它 (disable-model-invocation,用户直接调) |
| ask-sonner | Sonner (React toast 库) 全指南:安装、调用、样式、定位、排障 |
| break-ui | 用最坏数据砸界面 (超长名、空字段、极端数字、非拉丁文),列出砸坏的点与修法 |
| choreograph | 编排多元素一起动的动效:先后顺序、重叠、留白,读起来是一次有意图的运动 |
| emil-design-eng | Emil 的设计工程哲学:按压态、悬停、弹窗原点、提示时机等看不见的细节;没有更窄的技能合用时用它 |
| find-animation-opportunities | 只读:扫代码库或界面,找出该动却没动的地方,并否决不该动的;只提方案不落地 |
| gestures | 拖、滑、抽屉等手势交互:跟手 1:1、可中途打断;手势发飘、松手跳变时用 |
| improve-animations | 只读:全库动效审计,出优先级清单与可执行计划,不直接改代码 |
| learn-taste | 把一次设计的纠正沉淀成规则,写进 DESIGN.md、项目技能或 lint 检查 |
| mobile-native | 让 Web 应用在手机上像原生:sticky hover、100vh、点按缩放、刘海、PWA、触摸 |
| pick-ui-library | 按任务从精选清单里选 UI 库:primitives、toast、抽屉、命令菜单、图表、拖拽等 |
| prototype | 一次出多个真正不同的 UI 版本,放进可视选择器里翻着看,挑中的再提拔 |
| remove-animations | 找出界面里不需要的动效并删掉:只做减法,不加不调;觉得 "动效太多、显慢" 时用 |
| review-animations | 按高标准评审动效代码,默认挑刺,通过要靠挣 |
| write-swift | 现代 Swift 写法:值类型、Swift 6 并发、协议泛型、API 设计、性能、Swift Testing、宏 |

另有 `performance-cheatsheet.md` (性能速查) 与 `ui-cheatsheet.md` (界面速查) 两张速查表.

## 怎么用

1. 做动效前先读 `skills/animate/SKILL.md` 定决策顺序;已有动效要改,先读 `skills/review-animations/SKILL.md` 或 `skills/improve-animations/SKILL.md`.
2. 不知道用哪个:读 `skills/ask-emil/SKILL.md` (路由器).
3. 各技能正文按 Claude Code / Codex / Cursor 写,其他 AI 照方法用,跳过平台专属步骤.
4. `learn-taste`、`pick-ui-library`、`prototype`、`review-animations`、`ask-emil` 五个技能标了 `disable-model-invocation`,意思是不要由模型自动触发,用户点名要时才用.

## 说明

- 上游同时在 [aiforui.dev/skills](https://aiforui.dev/skills) 提供每个技能的示例效果与试用提示词.
- 本库收录上游 `skills/` 全部 20 个技能正文 (含 RECIPES、CATALOG、AUDIT 等附属文件) 与两张速查表,全文未改.
