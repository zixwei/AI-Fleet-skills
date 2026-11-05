# zixwei 团队共享技能索引（可直接粘贴给 Muse / Perplexity / Manus / Gemini / Copilot）
更新：2026-11-05｜维护：ai总管｜全文在本库 <名字>/SKILL.md
标记：[方法] 纯方法文字，外部 AI 拿到全文就能照做；[本机] 要用 Grok Bot 电脑上的脚本/服务，外部 AI 只需知道它存在，结果由 Grok Bot 跑。（用方括号，不用【】：muse2api 会把【】当引用标记删掉，2026-11-01 实测）
用法：任务匹配到某条时，按「何时用」行事；需要细节时请对方（Grok Bot）把该技能全文贴给你。团队规则见另贴的《外部 AI 工具通用规则》，冲突时以规则为准。

## 1. 团队规则与协作
- zixwei-decisions[方法]所有 bot 动手前读规则清单、对照执行、新规则当场写入。何时用：任何工作、发帖、回答前。
- crew-contract[方法]bot 之间派活/交接：7 字段任务卡、带产物交接、不自审、最多退回 2 轮、人工闸门。何时用：交接或验收别人的产出。
- quota-checkpoint[方法]长任务拆小步、每步存文件和 PROGRESS.md、额度用完换工具从断点续做。何时用：多步任务、续做中断任务。
- fact-check-coverage[方法]事实类结论先查全官方文档+中英日教程论坛再下结论。何时用：规则、费用、资格、平台政策类问题。
- self-improving-agent[方法]记录出错、被纠正和更好做法，下次先复查。何时用：出错或被纠错后。
- humanizer[方法]去掉 AI 腔（套话、三连排比、破折号、空洞收尾）。何时用：改写英文/中文文稿。
- grok-bot-token-saver[方法]省额度：总管/工人分工、短角色卡、长对话交接到新对话。何时用：上下文或额度浪费时。
- Root Agent 协作框架[方法]access-probe（先探测可用）、intake-clarify（需求澄清）、scope-guard（控范围）、route-and-dispatch / lead-handoff / lead-dispatch / lead-integrate（派活与整合）、work-control / portfolio-status（队列与进度）、quality-review（独立审核）、blocker-escalation（卡住升级）、result-relay / user-report（汇报）、learning-loop（沉淀教训）、bind-routine-via-owner（定时任务归属）、roster-management / team-prompting / standing-workspace / getting-started / deleted-work-cleanup（编队与清理）。何时用：多 bot 协调。
- growth-fleet-starter / botteams / grok-bot-profiles[方法]搭出海增长 bot 队伍、现成 bot 团队模板、互查开发 bot 模板。何时用：规划新 bot（建 bot 须 zixwei 同意）。

## 2. 交易、行情、复盘（只研究，不荐股不下单；交易助手例外见 DECISIONS 第 8 节）
- global-stock-data[本机]美股/港股代码取数：报价、K 线、期权链、SEC 文件、13F、财报、VIX、美债。何时用：美股数据。
- easy-tdx[本机]通达信协议免密钥行情（A/美/港/期货）、分钟线、指标。何时用：快速报价、K 线。
- a-stock-data[本机]A 股数据（资金流、估值、公告、研报、北向）。何时用：只限 A 股，不与美股混用。
- finance-quant-skills[本机]AKShare 多市场数据 + Backtrader 教学回测。何时用：历史回测练习。
- tradingagents-us[本机]美股多分析师多空辩论压力测试（经 muse2api 跑时不调用自带 SEC/行情数据，数字须再核），可给过往模型判断打分（backtest / settle）。何时用：交易助手做个股压力测试；风控复盘官做第二意见和命中率参考。评级不是建议。
- tradingagents-astock[本机]同框架 A 股版。何时用：A 股压力测试。
- gsq-*（10 个）[本机/方法]高盛 gs_quant：gsq-timeseries-free 免账号算波动率、回撤、beta、RSI 等；其余需 GS 账号。何时用：对一段价格序列做风险指标。
- hg-*（17 个）[本机]Hyperliquid 交易台：读账户、行情、风控限额、下单流程、复盘、事故处理。何时用：仅 Hyperliquid；任何下单须 zixwei 本人批准。其中 hg-desk-risk-limits、hg-desk-post-trade-review、hg-desk-execution-protocol 的方法（限额、下单前清单、过程 vs 结果复盘）可借鉴到 IBKR 模拟盘。
- openstock / tick-stock-panel[本机]本地看盘网页 / 选股监控回测面板。何时用：人看图或面板 API。

## 3. 内容、配图、设计
- chart-chooser[方法]选图表类型、坐标轴基线、配色、防误导。何时用：做行情图前。
- ab-test-analyzer[方法]A/B 测试样本量、显著性检验（发帖写法、时间、配图对比）。何时用：判断哪种写法更好。
- competitive-analysis[方法]竞品矩阵、SWOT、定位图、带出处和日期的证据。何时用：对标账号/产品分析。
- hyperframes-video[本机]HTML 本地渲染短视频（图表动画、标题卡、字幕、竖版），不上传不付费。何时用：需要视频素材时。
- taste-skill / awesome-design-skills / ui-ux-pro-max / impeccable / hallmark[方法]网页和界面设计：风格模板、审美、可用性审查、AI 味检查。何时用：做或审网页、Page、落地页。

## 4. 工程与工具
- matt-pocock-skills[方法]TDD、代码审查、调 bug、规格拆票、PR、交接、拷问方案等工程流程。何时用：写代码。
- addy-agent-skills[方法]安全加固、日志监控告警、CI/CD、上线清单、质量门槛合同。何时用：自动下单程序、服务器方案等要上线的东西。
- ponytail[方法]最小改动解决问题、拒绝过度设计。何时用：任何编码。
- codebase-memory[本机]把大代码库建成图谱查调用关系。何时用：读陌生仓库。
- markitdown[本机]PDF/Word/Excel/PPT/网页转 Markdown。何时用：读非纯文本文件。
- skill-creator / find-skills[方法]写技能、找可装技能。何时用：扩展能力。

## 5. AI 工具
- muse2api[本机]本机 Muse 接口（聊天、生图、生视频），先 acc-02（微软号）后 acc-01（谷歌号）免费额度（zixwei 2026-11-01 10:37 ET）。何时用：重活外包。
- muse-playbook[方法]300 条 Muse 玩法（含 Muse 做不到的「实话实说」）。何时用：问 Muse 能做什么、怎么说。
