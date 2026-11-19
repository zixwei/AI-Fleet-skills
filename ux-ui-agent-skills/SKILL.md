---
name: ux-ui-agent-skills
description: plugin87/ux-ui-agent-skills (XIAS) v3.1.1, 26 UX/UI design-system skills for coding agents - DTCG 3-tier tokens, component specs, code for any framework, WCAG 2.2 AA-AAA audits, design review and critique, anti-AI-slop taste doctrine. Use when designing, building, reviewing, or redesigning any screen, component, token set, or dashboard.
license: MIT
metadata:
  author: https://github.com/plugin87
  version: "3.1.1"
---
来源:https://github.com/plugin87/ux-ui-agent-skills (2026-11-19 ET 核实,上游提交 d0ee2fa3,v3.1.1,3,205 stars,许可证 MIT).Trendshift 2026-11-19 每日榜发现,用户 2026-11-19 09:07 ET 点头入库.

# UX/UI Agent Skills (XIAS) 设计系统技能集

给写代码的 AI 用的设计系统 doctrine:怎么做才算高级感界面,以及怎么验收.专治 AI 味界面 (紫渐变 + 四张等大卡片 + emoji 图标).纯指令与知识层,无构建工具,无依赖,无运行时.

## 适用平台 (先看)

- 技能正文按 Claude Code 写:路径用 `${CLAUDE_SKILL_DIR}/../../../`,提到 Stop hook,Claude Code 插件.上游同时支持 Codex,Cursor,Copilot,Gemini CLI.
- 其他 AI (Muse,Manus 等) 读本库时:把 `${CLAUDE_SKILL_DIR}/../../../` 理解成本目录 `ux-ui-agent-skills/`,方法,标准,清单照用;hook 与插件相关步骤跳过.
- scaffold-project,observe 两条只对 Claude Code 有用.

## 前提

- 只读方法:不需要任何安装,读本目录即可.
- 要跑 52 个验收门 (实测对比度,键盘,目标尺寸,280px 不横向溢出等):本库没收门脚本,须装上游全套:`npx ux-ui-agent-skills@3.1.1 init`,需 Node,其中 34 个门要开真实浏览器渲染.
- 没装全套时按上游规定走 guidance-only 模式:不报任何实测数字 (对比度,N/N,"通过 WCAG"),该写数字的地方写 not verified,结尾列出跳过的门.这条与舰队第 0 节严谨规则一致.

## 怎么用

1. 任何设计/UI 任务先读 `skills/design-doctrine/SKILL.md` (总纲).
2. 按任务读对应技能 `skills/<名字>/SKILL.md`,再按它点名的参考文件读 `taste/`,`workflows/`,`components/`,`accessibility/`,`frameworks/`,`tokens/`,`content/`,`reference/`.
3. 做完按 gate/ship 的要求验收;没装门就按 guidance-only 模式如实写.

## 收录清单 (26 技能)

- [design-doctrine](skills/design-doctrine/SKILL.md):总纲,任何设计/UI 工作先读:验证协议 (先跑门再报数,没测过就写 not verified),禁 emoji,按意图取 token,一套共享主题,8 种状态,一屏一个主角,产出完整.
- [design-screen](skills/design-screen/SKILL.md):从需求到整页/整屏/落地页/网站/App 的全流程.
- [design-component](skills/design-component/SKILL.md):组件规格:结构,变体,尺寸,8 种状态,token 映射,无障碍.
- [design-code](skills/design-code/SKILL.md):任意框架出生产级,无障碍,token 驱动的组件代码.
- [design-tokens](skills/design-tokens/SKILL.md):DTCG 格式三层 token (primitive, semantic, component) 的生成,扩展,审计.
- [token-build](skills/token-build/SKILL.md):token 构建管线:DTCG json 转 CSS 变量,Tailwind,JS/TS,iOS,Android,Compose.
- [brandkit](skills/brandkit/SKILL.md):从 brief 生成整套品牌设计系统 (明暗两套 + theme.css),按 WCAG 验证.
- [apply-aesthetic](skills/apply-aesthetic/SKILL.md):套用视觉方向/原型风格,或上游 2,144 个具名设计系统之一.
- [migrate-design-system](skills/migrate-design-system/SKILL.md):与外部设计系统 (Material 3, Apple HIG, Fluent, Carbon, shadcn/ui 等) 互相映射或迁移.
- [image-to-code](skills/image-to-code/SKILL.md):参考图/截图/稿子转 token 驱动的无障碍代码.
- [data-dashboard](skills/data-dashboard/SKILL.md):高密度数据屏 (分析台,交易终端):K 线,成交量,深度,热力图等用 token 画.
- [redesign](skills/redesign/SKILL.md):不破坏功能的前提下把现有网站/App 升级到高级感,先找 AI 味再动手.
- [critique](skills/critique/SKILL.md):对抗式设计批评:渲染出来看,站在否决方挑毛病;门全绿之后做,不能替代门.
- [design-review](skills/design-review/SKILL.md):6 个加权维度 + Nielsen 10 条启发式的设计评审,出优先级问题表.
- [a11y-audit](skills/a11y-audit/SKILL.md):按 WCAG 2.2 AA/AAA 与 ARIA 模式做无障碍审计,逐条给准则,严重度,修法.
- [design-qa](skills/design-qa/SKILL.md):设计 QA 门:token/硬编码 lint,自动 a11y,对比度,视觉回归,人工 a11y 清单.
- [gate](skills/gate/SKILL.md):一条命令跑质量门,报真实 N/N.
- [ship](skills/ship/SKILL.md):发版前总检:全门 + 响应式 + 渲染检查 + 发版清单.
- [performance](skills/performance/SKILL.md):按 Core Web Vitals (LCP, INP, CLS) 优化 UI 性能.
- [prototype](skills/prototype/SKILL.md):保真度阶梯 (内容优先,线框,低保真,高保真,代码),每级带验证计划.
- [grill-me](skills/grill-me/SKILL.md):动手前追问 brief:只问会改变做法的问题,没问的决定写成明示假设.
- [ux-writing](skills/ux-writing/SKILL.md):UI 文案 (按钮,报错,空状态,微文案):语气体系 + 报错 what-why-how 公式.
- [figma-integration](skills/figma-integration/SKILL.md):Figma 与代码同步:三层 token 映射 Figma Variables,双向同步,组件对齐核查.
- [governance](skills/governance/SKILL.md):设计系统演进治理:SemVer,贡献流程,废弃策略,变更沟通.
- [scaffold-project](skills/scaffold-project/SKILL.md):按参考结构搭新设计产品项目骨架 (Claude Code 布局).
- [observe](skills/observe/SKILL.md):看 agent 近几次会话有没有守规则 (只读本地 hook 事件).

## 一并入库的参考文件

- `taste/` (3):反 AI 味 doctrine,审美体系,动效编排.
- `workflows/` (9):设计评审,设计转代码,原型,QA,治理,性能,Figma,改版审计,token 构建.
- `components/` (11),`accessibility/` (6),`frameworks/` (20,含 16 个框架适配),`tokens/` (14 个 DTCG json),`content/` (1),`reference/` (1),`docs/` (9).
- `UPSTREAM-AGENTS.md`,`UPSTREAM-README.md`:上游根目录 AGENTS.md 与 README.md 原文,改名存放以免与本库文件混淆.`LICENSE`:上游 MIT 原文.

## 未收录

- `design-systems/` (2,144 个实测设计系统,约 32MB):太大,apply-aesthetic 与 migrate-design-system 要查具名设计系统时去上游读.
- `scripts/` (52 个门脚本),`hooks/`,`mcp/`,`bin/`,`evals/`,`tests/`,`templates/`,`examples/` (含图片等二进制):运行件与样例,不是方法本体,装上游全套即有.

## 与库里已有技能的分工

- taste-skill,impeccable,awesome-design-skills:审美判断与打磨.本条目的 `taste/` 同向,多了可量化的验收标准.
- ui-ux-pro-max:UI/UX 设计智能 (风格,配色,字体检索).本条目重在设计系统工程:三层 token,组件 8 状态,无障碍门,评审维度.
- chart-chooser:选图表类型.本条目的 data-dashboard 管高密度数据屏整体怎么做.
- 做行情/交易类界面时两边一起读.
