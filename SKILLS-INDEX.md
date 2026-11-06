# zixwei 团队共享技能索引（可直接粘贴给 Muse / Perplexity / Manus / Gemini / Copilot）
更新：2026-11-06｜维护：ai总管｜全文在本库 <名字>/SKILL.md
标记：[方法] 纯方法文字，外部 AI 拿到全文就能照做；[本机] 要用 Grok Bot 电脑上的脚本/服务，外部 AI 只需知道它存在，结果由 Grok Bot 跑。（用方括号，不用：muse2api 会把当引用标记删掉，2026-11-01 实测）
用法：任务匹配到某条时，按「何时用」行事；需要细节时请对方（Grok Bot）把该技能全文贴给你。团队规则见另贴的《外部 AI 工具通用规则》，冲突时以规则为准。
说明：[方法] 在本库有全文（<名字>/SKILL.md）；[本机] 不在本库，在 Grok Bot 电脑上，外部 AI 只需知道它存在。

## 1. 规则（先读）
- zixwei-decisions[规则库]所有 bot 动手前读规则清单、对照执行、新规则当场写入。全文在公开规则库 zixwei/AI-Fleet-rules，不在本库。何时用：任何工作、发帖、回答前。

## 2. 派单与交接
- crew-contract[方法]bot 之间派活/交接：7 字段任务卡、带产物交接、不自审、最多退回 2 轮、人工闸门。何时用：交接或验收别人的产出。
- route-and-dispatch[方法]任务路由与派单：判断任务归谁、按替补链派发。何时用：收到任务要分出去时。
- lead-dispatch[方法]把线索/任务派给执行方。何时用：把活派给某个 bot 或工具时。
- lead-handoff[方法]任务交接：把进行中的任务连同上下文交到下一手。何时用：换人接手时。
- lead-integrate[方法]整合各方产出：把多路结果汇总成一份交付。何时用：多 bot 并行做完要汇总时。
- intake-clarify[方法]接单先澄清需求：把含糊要求问清楚再开工。何时用：任务要求不清楚时。
- access-probe[方法]先探测可用：动手前确认工具/权限/额度可用。何时用：不确定某工具能不能用时。
- scope-guard[方法]控范围：守住任务边界，不蔓延、不加活。何时用：任务有扩大苗头时。
- bind-routine-via-owner[方法]定时任务归属：routine 挂到负责人名下。何时用：设定时任务、routine 时。

## 3. 执行、进度与续做
- work-control[方法]工作队列控制：排队、限流、防重复。何时用：多任务并行要排队时。
- portfolio-status[方法]进度状态：看各任务进行到哪、卡在哪。何时用：查进度、对账时。
- quota-checkpoint[方法]长任务拆小步、每步存文件和 PROGRESS.md、额度用完换工具从断点续做。何时用：多步任务、续做中断任务。
- blocker-escalation[方法]卡住升级：遇到阻塞按规则上报、换路。何时用：任务卡住推进不了时。
- learning-loop[方法]沉淀教训：把出错和更好做法记下来，下次先复查。何时用：出错或被纠错后。
- self-improving-agent[方法]记录出错、被纠正和更好做法，下次先复查。何时用：出错或被纠错后。
- standing-workspace[方法]常驻工作区：长期任务的固定落点和状态。何时用：长期/常驻任务。
- getting-started[方法]上手指南：新成员/新任务快速入门。何时用：刚接手、不熟流程时。
- deleted-work-cleanup[方法]清理已删工作：删掉的任务、文件、卡片收尾。何时用：删任务/删 Bot 后。
- chief-of-staff[方法]幕僚长模式：用户杂乱倾倒自动理顺成一日计划（带优先级与冲突解法、代起草消息、逐项算账、必办清单≤3件）。何时用：用户一股脑倒想法、任务、待办时。

## 4. 核查、复核与汇报
- fact-check-coverage[方法]事实类结论先查全官方文档+中英日教程论坛再下结论。何时用：规则、费用、资格、平台政策类问题。
- quality-review[方法]独立审核：换一名不同成员按标准复核一次。何时用：重要产出交付前。
- result-relay[方法]结果转达：把执行结果和链接原样报给需要的人。何时用：做完要汇报时。
- user-report[方法]给用户汇报：结论+链接，简短直接。何时用：向 zixwei 汇报时。
- humanizer[方法]去掉 AI 腔（套话、三连排比、破折号、空洞收尾）。何时用：改写英文/中文文稿。

## 5. 队伍与 Bot
- roster-management[方法]编队与花名册：管成员名单、分工、状态。何时用：增减成员、查分工时。
- team-prompting[方法]团队提示词：给多 bot 写统一的提示词和口径。何时用：多 bot 协作要统一口径时。
- botteams[方法]现成 bot 团队模板。何时用：规划新 bot 队伍时。
- grok-bot-profiles[方法]Grok Bot 档案/模板：互查开发 bot 的模板。何时用：建新 Bot、查 Bot 配置时。
- growth-fleet-starter[方法]搭出海增长 bot 队伍的开工包。何时用：规划增长类新 bot（建 bot 须 zixwei 同意）。
- grok-bot-token-saver[方法]省额度：总管/工人分工、短角色卡、长对话交接到新对话。何时用：上下文或额度浪费时。

## 6. 交易、行情与复盘（只研究，不荐股不下单；交易助手例外见 DECISIONS 第 8 节）
- gsq-timeseries-free[方法]高盛 gs_quant 时序免费分析：波动率、回撤、beta、RSI 等，免账号。何时用：对一段价格序列做风险指标。
- global-stock-data[本机]美股/港股代码取数：报价、K 线、期权链、SEC 文件、13F、财报、VIX、美债。何时用：美股数据。
- easy-tdx[本机]通达信协议免密钥行情（A/美/港/期货）、分钟线、指标。何时用：快速报价、K 线。
- a-stock-data[本机]A 股数据（资金流、估值、公告、研报、北向）。何时用：只限 A 股，不与美股混用。
- finance-quant-skills[本机]AKShare 多市场数据 + Backtrader 教学回测。何时用：历史回测练习。
- tradingagents-us[本机]美股多分析师多空辩论压力测试（经 muse2api 跑时不调用自带 SEC/行情数据，数字须再核），可给过往模型判断打分。何时用：交易助手做个股压力测试；风控复盘官做第二意见。评级不是建议。
- tradingagents-astock[本机]同框架 A 股版。何时用：A 股压力测试。
- gsq-*[本机/方法]高盛 gs_quant 其余技能：需 GS 账号。何时用：gs_quant 高级功能。
- hg-*[本机]Hyperliquid 交易台（17 个）：读账户、行情、风控限额、下单流程、复盘、事故处理。何时用：仅 Hyperliquid；任何下单须 zixwei 本人批准。其中 hg-desk-risk-limits、hg-desk-post-trade-review、hg-desk-execution-protocol 的方法可借鉴到 IBKR 模拟盘。
- openstock / tick-stock-panel[本机]本地看盘网页 / 选股监控回测面板。何时用：人看图或面板 API。

## 7. 内容、配图与设计
- chart-chooser[方法]选图表类型、坐标轴基线、配色、防误导。何时用：做行情图前。
- ab-test-analyzer[方法]A/B 测试样本量、显著性检验（发帖写法、时间、配图对比）。何时用：判断哪种写法更好。
- competitive-analysis[方法]竞品矩阵、SWOT、定位图、带出处和日期的证据。何时用：对标账号/产品分析。
- taste-skill[方法]审美与品味：设计判断标准。何时用：做或审网页、Page、落地页。
- awesome-design-skills[方法]设计技能合集：风格模板、审美。何时用：做或审网页、Page、落地页。
- ui-ux-pro-max[方法]UI/UX 设计：界面与体验。何时用：做或审网页、Page、落地页。
- impeccable[方法]设计与打磨：细节与完成度。何时用：做或审网页、Page、落地页。
- hallmark[方法]Hallmark 配图风格。何时用：做配图时。
- hyperframes-video[本机]HTML 本地渲染短视频（图表动画、标题卡、字幕、竖版），不上传不付费。何时用：需要视频素材时。

## 8. 工程、技能与 AI 工具
- matt-pocock-skills[方法]TDD、代码审查、调 bug、规格拆票、PR、交接、拷问方案等工程流程。何时用：写代码。
- addy-agent-skills[方法]安全加固、日志监控告警、CI/CD、上线清单、质量门槛合同。何时用：自动下单程序、服务器方案等要上线的东西。
- ponytail[方法]最小改动解决问题、拒绝过度设计。何时用：任何编码。
- skill-creator[方法]写技能：把方法写成可复用的技能。何时用：扩展能力、沉淀新方法时。
- find-skills[方法]找可装技能。何时用：需要新技能时。
- muse-playbook[方法]300 条 Muse 玩法（含 Muse 做不到的「实话实说」）。何时用：问 Muse 能做什么、怎么说。
- codebase-memory[本机]把大代码库建成图谱查调用关系。何时用：读陌生仓库。
- markitdown[本机]PDF/Word/Excel/PPT/网页转 Markdown。何时用：读非纯文本文件。
- muse2api[本机]本机 Muse 接口（聊天、生图、生视频），先 acc-02（微软号）后 acc-01（谷歌号）免费额度（zixwei 2026-11-01 10:37 ET）。何时用：重活外包。
