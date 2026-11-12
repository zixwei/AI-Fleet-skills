# zixwei 团队共享技能索引(可直接粘贴给 Muse / Perplexity / Manus / Gemini / Copilot)
更新:2026-11-11｜维护:ai总管
标记:功能分类统一为 [方法].方法可以写环境前提.标签只标明条目性质,不授予执行能力或权限.索引用方括号;中文方头括号会被 muse2api 当成引用标记删掉(2026-11-01 实测).
用法:任务匹配到某条时,按「何时用」行事,并先满足该条写明的环境前提.团队规则见另贴的<外部 AI 工具通用规则>,冲突时以规则为准.
说明:部分方法全文在本库,沿用本库现有链接,即相对路径 `<名字>/SKILL.md`.部分方法全文在私有库 [AI-Fleet-memory](https://github.com/zixwei/AI-Fleet-memories) 的 `shared/skills/<技能名>/SKILL.md`,需用户已授予相应访问授权;未获授权由 ai总管安排.不得假定其他 AI 能访问 Grok Bot 的 `/workspace` 或 `127.0.0.1`.不将私有正文或凭据公开.指向私有库的链接只是索引地址.并不是每条方法在本公开库都有正文.
计数:按条目47公开(46本库方法+1跨库规则),14私有引用/组合;按文件目标46本库公开,1跨库规则,15私有(hg一条3链接,gsq组合无href);另2仓库主页导航,共64个Markdown链接.条目口径与文件目标口径分开计.全表仍是61条,其中60条方法,1条规则.口径:46 是本库实有目录数,61 是含私有引用的全表条目数(60 方法 + 1 规则).

## 1. 规则(先读)
- [zixwei-decisions](https://github.com/zixwei/AI-Fleet-rules/blob/main/SKILL.md)[规则库]所有 bot 动手前读规则清单,对照执行,新规则当场写入.全文在公开规则库 [zixwei/AI-Fleet-rules](https://github.com/zixwei/AI-Fleet-rules),不在本库.何时用:任何工作,发帖,回答前.

## 2. 派单与交接
- [crew-contract](crew-contract/SKILL.md)[方法]bot 之间派活/交接:7 字段任务卡,带产物交接,不自审,最多退回 2 轮,人工闸门.何时用:交接或验收别人的产出.
- [route-and-dispatch](route-and-dispatch/SKILL.md)[方法]任务路由与派单:判断任务归谁,按替补链派发.何时用:收到任务要分出去时.
- [lead-dispatch](lead-dispatch/SKILL.md)[方法]把线索/任务派给执行方.何时用:把活派给某个 bot 或工具时.
- [lead-handoff](lead-handoff/SKILL.md)[方法]任务交接:把进行中的任务连同上下文交到下一手.何时用:换人接手时.
- [lead-integrate](lead-integrate/SKILL.md)[方法]整合各方产出:把多路结果汇总成一份交付.何时用:多 bot 并行做完要汇总时.
- [intake-clarify](intake-clarify/SKILL.md)[方法]接单先澄清需求:把含糊要求问清楚再开工.何时用:任务要求不清楚时.
- [access-probe](access-probe/SKILL.md)[方法]先探测可用:动手前确认工具/权限/额度可用.何时用:不确定某工具能不能用时.
- [scope-guard](scope-guard/SKILL.md)[方法]控范围:守住任务边界,不蔓延,不加活.何时用:任务有扩大苗头时.
- [bind-routine-via-owner](bind-routine-via-owner/SKILL.md)[方法]定时任务归属:routine 挂到负责人名下.何时用:设定时任务,routine 时.

## 3. 执行,进度与续做
- [work-control](work-control/SKILL.md)[方法]工作队列控制:排队,限流,防重复.何时用:多任务并行要排队时.
- [portfolio-status](portfolio-status/SKILL.md)[方法]进度状态:看各任务进行到哪,卡在哪.何时用:查进度,对账时.
- [quota-checkpoint](quota-checkpoint/SKILL.md)[方法]长任务拆小步,每步存文件和 PROGRESS.md,额度用完换工具从断点续做.何时用:多步任务,续做中断任务.
- [blocker-escalation](blocker-escalation/SKILL.md)[方法]卡住升级:遇到阻塞按规则上报,换路.何时用:任务卡住推进不了时.
- [learning-loop](learning-loop/SKILL.md)[方法]沉淀教训:把出错和更好做法记下来,下次先复查.何时用:出错或被纠错后.
- [self-improving-agent](self-improving-agent/SKILL.md)[方法]记录出错,被纠正和更好做法,下次先复查.何时用:出错或被纠错后.
- [standing-workspace](standing-workspace/SKILL.md)[方法]常驻工作区:长期任务的固定落点和状态.何时用:长期/常驻任务.
- [getting-started](getting-started/SKILL.md)[方法]上手指南:新成员/新任务快速入门.何时用:刚接手,不熟流程时.
- [deleted-work-cleanup](deleted-work-cleanup/SKILL.md)[方法]清理已删工作:删掉的任务,文件,卡片收尾.何时用:删任务/删 Bot 后.
- [chief-of-staff](chief-of-staff/SKILL.md)[方法]幕僚长模式:用户杂乱倾倒自动理顺成一日计划(带优先级与冲突解法,代起草消息,逐项算账,必办清单≤3件).何时用:用户一股脑倒想法,任务,待办时.

## 4. 核查,复核与汇报
- [fact-check-coverage](fact-check-coverage/SKILL.md)[方法]事实类结论先查全官方文档+中英日教程论坛再下结论.何时用:规则,费用,资格,平台政策类问题.
- [quality-review](quality-review/SKILL.md)[方法]独立审核:换一名不同成员按标准复核一次.何时用:重要产出交付前.
- [result-relay](result-relay/SKILL.md)[方法]结果转达:把执行结果和链接原样报给需要的人.何时用:做完要汇报时.
- [user-report](user-report/SKILL.md)[方法]给用户汇报:结论+链接,简短直接.何时用:向 zixwei 汇报时.
- [humanizer](humanizer/SKILL.md)[方法]去掉 AI 腔(套话,三连排比,破折号,空洞收尾).何时用:改写英文/中文文稿.

## 5. 队伍与 Bot
- [roster-management](roster-management/SKILL.md)[方法]编队与花名册:管成员名单,分工,状态.何时用:增减成员,查分工时.
- [team-prompting](team-prompting/SKILL.md)[方法]团队提示词:给多 bot 写统一的提示词和口径.何时用:多 bot 协作要统一口径时.
- [botteams](botteams/SKILL.md)[方法]现成 bot 团队模板.何时用:规划新 bot 队伍时.
- [grok-bot-profiles](grok-bot-profiles/SKILL.md)[方法]Grok Bot 档案/模板:互查开发 bot 的模板.何时用:建新 Bot,查 Bot 配置时.
- [growth-fleet-starter](growth-fleet-starter/SKILL.md)[方法]搭出海增长 bot 队伍的开工包.何时用:规划增长类新 bot(建 bot 须 zixwei 同意).
- [grok-bot-token-saver](grok-bot-token-saver/SKILL.md)[方法]省额度:总管/工人分工,短角色卡,长对话交接到新对话.何时用:上下文或额度浪费时.

## 6. 交易,行情与复盘(只研究,不荐股不下单;交易助手例外见 DECISIONS 第 8 节)
- [gsq-timeseries-free](gsq-timeseries-free/SKILL.md)[方法]高盛 gs_quant 时序免费分析:波动率,回撤,beta,RSI 等,免账号.何时用:对一段价格序列做风险指标.全文在本库.
- [global-stock-data](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/global-stock-data/SKILL.md)[方法]美股/港股代码取数:报价,K 线,期权链,SEC 文件,13F,财报,VIX,美债.何时用:美股数据.前提:对应 Python 与数据源;公开行情不统一要求账号.
- [easy-tdx](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/easy-tdx/SKILL.md)[方法]通达信协议免密钥行情(A/美/港/期货),分钟线,指标.何时用:快速报价,K 线.前提:对应 Python 与数据源;免密钥,不按需账号处理.
- [a-stock-data](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/a-stock-data/SKILL.md)[方法]A 股数据(资金流,估值,公告,研报,北向).何时用:只限 A 股,不与美股混用.前提:对应 Python 与数据源;公开行情不统一要求账号.
- [finance-quant-skills](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/finance-quant-skills/SKILL.md)[方法]AKShare 多市场数据 + Backtrader 教学回测.何时用:历史回测练习.前提:对应 Python 与数据源;公开行情不统一要求账号.
- [tradingagents-us](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/tradingagents-us/SKILL.md)[方法]美股多分析师多空辩论压力测试(经 muse2api 跑时不调用自带 SEC/行情数据,数字须再核),可给过往模型判断打分.何时用:交易助手做个股压力测试;风控复盘官做第二意见.评级不是建议.前提:框架与 LLM 环境,不带实盘权.
- [tradingagents-astock](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/tradingagents-astock/SKILL.md)[方法]同框架 A 股版.何时用:A 股压力测试.前提:框架与 LLM 环境,不带实盘权.
- gsq 非时序[方法]高盛 gs_quant 其余技能.何时用:gs_quant 高级功能.前提:本地构造,模拟单测,处理已有结果可免账号;Marquee 定价,真实数据,服务器回测需机构授权.9 个非 timeseries 完整指南位于私有方法入口内的 GUIDE.md,需访问授权;运行环境与GS授权另核验.
- hg 交易台[方法]Hyperliquid 交易台(17 个):读账户,行情,风控限额,下单流程,复盘,事故处理.何时用:仅 Hyperliquid;任何下单须 zixwei 本人批准.其中 [hg-desk-risk-limits](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/hg-desk-risk-limits/SKILL.md),[hg-desk-post-trade-review](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/hg-desk-post-trade-review/SKILL.md),[hg-desk-execution-protocol](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/hg-desk-execution-protocol/SKILL.md) 的方法可借鉴到 IBKR 模拟盘.前提:公开行情,info 与公开 WebSocket 免签名;账户读需地址;签名交易需安全配置及用户批准.其余 14 个目录名以私有库实际技能名为准,本索引不编造链接.
- [openstock](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/openstock/SKILL.md)[方法]本地看盘网页.何时用:人看图.前提:本地实例不可跨机器直连,环境另核.
- [tick-stock-panel](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/tick-stock-panel/SKILL.md)[方法]选股监控回测面板.何时用:面板 API.前提:本地实例不可跨机器直连,环境另核.

## 7. 内容,配图与设计
- [chart-chooser](chart-chooser/SKILL.md)[方法]选图表类型,坐标轴基线,配色,防误导.何时用:做行情图前.
- [ab-test-analyzer](ab-test-analyzer/SKILL.md)[方法]A/B 测试样本量,显著性检验(发帖写法,时间,配图对比).何时用:判断哪种写法更好.
- [competitive-analysis](competitive-analysis/SKILL.md)[方法]竞品矩阵,SWOT,定位图,带出处和日期的证据.何时用:对标账号/产品分析.
- [taste-skill](taste-skill/SKILL.md)[方法]审美与品味:设计判断标准.何时用:做或审网页,Page,落地页.
- [awesome-design-skills](awesome-design-skills/SKILL.md)[方法]设计技能合集:风格模板,审美.何时用:做或审网页,Page,落地页.
- [ui-ux-pro-max](ui-ux-pro-max/SKILL.md)[方法]UI/UX 设计:界面与体验.何时用:做或审网页,Page,落地页.
- [impeccable](impeccable/SKILL.md)[方法]设计与打磨:细节与完成度.何时用:做或审网页,Page,落地页.
- [hallmark](hallmark/SKILL.md)[方法]Hallmark 配图风格.何时用:做配图时.
- [hyperframes-video](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/hyperframes-video/SKILL.md)[方法]HTML 本地渲染短视频(图表动画,标题卡,字幕,竖版),不上传不付费.何时用:需要视频素材时.前提:需相应本地工具;依赖未满足由 ai总管安排.

## 8. 工程,技能与 AI 工具
- [matt-pocock-skills](matt-pocock-skills/SKILL.md)[方法]TDD,代码审查,调 bug,规格拆票,PR,交接,拷问方案等工程流程.何时用:写代码.
- [addy-agent-skills](addy-agent-skills/SKILL.md)[方法]安全加固,日志监控告警,CI/CD,上线清单,质量门槛合同.何时用:自动下单程序,服务器方案等要上线的东西.
- [ponytail](ponytail/SKILL.md)[方法]最小改动解决问题,拒绝过度设计.何时用:任何编码.
- [skill-creator](skill-creator/SKILL.md)[方法]写技能:把方法写成可复用的技能.何时用:扩展能力,沉淀新方法时.
- [find-skills](find-skills/SKILL.md)[方法]找可装技能.何时用:需要新技能时.
- [muse-playbook](muse-playbook/SKILL.md)[方法]300 条 Muse 玩法(含 Muse 做不到的「实话实说」).何时用:问 Muse 能做什么,怎么说.
- [codebase-memory](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/codebase-memory/SKILL.md)[方法]把大代码库建成图谱查调用关系.何时用:读陌生仓库.前提:需相应本地工具;依赖未满足由 ai总管安排.
- [markitdown](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/markitdown/SKILL.md)[方法]PDF/Word/Excel/PPT/网页转 Markdown.何时用:读非纯文本文件.前提:需相应本地工具;依赖未满足由 ai总管安排.
- [muse2api](https://github.com/zixwei/AI-Fleet-memories/blob/main/shared/skills/muse2api/SKILL.md)[方法]本机 Muse 接口(聊天,生图,生视频),免费额度先 acc-02(微软号)后 acc-01(谷歌号)(zixwei 2026-11-01 10:37 ET).何时用:重活外包.前提:本地实例不可跨机器直连,环境另核.额外付费先经用户批准.密钥不外发.
- [improve](improve/SKILL.md)[方法]代码库审计与实施计划:贵模型审计判断、写自包含实施计划,便宜模型执行;只读源码、不改代码.何时用:审计代码库、找改进机会、给另一 agent 写实施计划时.前提:支持 Agent Skills 格式的 agent;计划为纯 Markdown,任何 agent 都能执行.
