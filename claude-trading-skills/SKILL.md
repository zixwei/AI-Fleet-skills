---
name: claude-trading-skills
description: tradermonty/claude-trading-skills - equity investing and trading process skills: market regime, breadth, screeners, technical analysis, position sizing, trade journal and post-mortem, with workflows and human decision gates. No signals, no order placement.
license: MIT
---
来源:https://github.com/tradermonty/claude-trading-skills (2026-11-19 ET 核实,上游提交 e31f799,MIT).Trendshift 2026-11-14 每日榜发现,用户 2026-11-19 09:19 ET 点头入库.

# 美股投研与交易流程技能集 (74 技能)

怎么做投研流程:市场状态判断,宽度,选股筛选,技术分析,仓位计算,交易日志与复盘,每步带人工决策门.上游明写:不是信号服务,不承诺收益,不下单.

## 舰队规则 (先看)

- 只研究.对外发帖不荐股,不喊单,不承诺收益;真钱下单,出入金须 zixwei 本人在聊天里明确同意.交易助手的例外见规则库 DECISIONS 第 8 节.
- 技能产出的数字 (估值,概率,回测) 用之前按第 0 节核实来源与时间.

## 适用平台与前提

- 正文按 Claude Code 写.本库只收方法:各技能 SKILL.md,references/,工作流与技能组合清单.上游每个技能自带的 Python 脚本 (scripts/) 与示例图没收,要跑脚本装上游.
- 部分技能要付费行情 API (FMP,FINVIZ Elite,Alpaca 等).不花钱:先用免 API 起步路径 (公开 CSV,图表截图,本地文件),见 `UPSTREAM-README.md` 与 trading-skills-navigator.

## 怎么用

1. 不知道用哪个:先读 `skills/trading-skills-navigator/SKILL.md`.
2. 按任务读 `skills/<名字>/SKILL.md` 与它的 `references/`.
3. 成套流程读 `workflows/` (每日市况,每周组合复盘,交易记忆循环等) 与 `skillsets/`.

## 收录清单
- [backtest-expert](skills/backtest-expert/SKILL.md):Expert guidance for systematic backtesting of trading strategies.
- [breadth-chart-analyst](skills/breadth-chart-analyst/SKILL.md):This skill should be used when analyzing market breadth charts, specifically the S&P 500 Breadth Index (200-Day MA based) and the US Stock Market Uptrend Stock Ratio charts.
- [breakout-trade-planner](skills/breakout-trade-planner/SKILL.md):Generate Minervini-style breakout trade plans from VCP screener output with worst-case risk calculation, portfolio heat management, and Alpaca-compatible order templates (stop-limit bracket for pre-pl
- [canslim-screener](skills/canslim-screener/SKILL.md):Screen US stocks using William O'Neil's CANSLIM growth stock methodology.
- [contrarian-setup-gate](skills/contrarian-setup-gate/SKILL.md):Synthesize the three Jason Shapiro contrarian-pipeline verdicts (COT crowding, news-reaction failure, weekly price-action confirmation) into one actionable setup_status via a fail-closed precedence st
- [cot-contrarian-detector](skills/cot-contrarian-detector/SKILL.md):Detect crowded speculative positioning in CFTC futures markets (COT report analysis) to find contrarian setups using Jason Shapiro's methodology.
- [crypto-regime-analyzer](skills/crypto-regime-analyzer/SKILL.md):Quantifies crypto market regime health using free, keyless public data (CoinGecko + Binance funding).
- [data-quality-checker](skills/data-quality-checker/SKILL.md):Validate data quality in market analysis documents and blog articles before publication.
- [dividend-growth-pullback-screener](skills/dividend-growth-pullback-screener/SKILL.md):Use this skill to find high-quality dividend growth stocks (12%+ annual dividend growth, 1.5%+ yield) that are experiencing temporary pullbacks, identified by RSI oversold conditions (RSI ≤40).
- [downtrend-duration-analyzer](skills/downtrend-duration-analyzer/SKILL.md):Analyze historical downtrend durations and generate interactive HTML histograms showing typical correction lengths by sector and market cap.
- [drawdown-circuit-breaker](skills/drawdown-circuit-breaker/SKILL.md):Evaluate account-level drawdown circuit breaker rules from trader-memory-core state and decide whether new trade risk is allowed today.
- [dual-axis-skill-reviewer](skills/dual-axis-skill-reviewer/SKILL.md):Review skills in any project using a dual-axis method: (1) deterministic code-based checks (structure, scripts, tests, execution safety) and (2) LLM deep review findings.
- [earnings-calendar](skills/earnings-calendar/SKILL.md):This skill retrieves upcoming earnings announcements for US stocks using the Financial Modeling Prep (FMP) API.
- [earnings-trade-analyzer](skills/earnings-trade-analyzer/SKILL.md):Analyze recent post-earnings stocks using a 5-factor scoring system (Gap Size, Pre-Earnings Trend, Volume Trend, MA200 Position, MA50 Position).
- [economic-calendar-fetcher](skills/economic-calendar-fetcher/SKILL.md):Fetch upcoming economic events and data releases using FMP API.
- [edge-candidate-agent](skills/edge-candidate-agent/SKILL.md):Generate and prioritize US equity long-side edge research tickets from EOD observations, then export pipeline-ready candidate specs for trade-strategy-pipeline Phase I.
- [edge-concept-synthesizer](skills/edge-concept-synthesizer/SKILL.md):Abstract detector tickets and hints into reusable edge concepts with thesis, invalidation signals, and strategy playbooks before strategy design/export.
- [edge-hint-extractor](skills/edge-hint-extractor/SKILL.md):Extract edge hints from daily market observations and news reactions, with optional LLM ideation, and output canonical hints.yaml for downstream concept synthesis and auto detection.
- [edge-pipeline-orchestrator](skills/edge-pipeline-orchestrator/SKILL.md):Orchestrate the full edge research pipeline from candidate detection through strategy design, review, revision, and export.
- [edge-signal-aggregator](skills/edge-signal-aggregator/SKILL.md):Aggregate and rank signals from multiple edge-finding skills (edge-candidate-agent, theme-detector, sector-analyst, institutional-flow-tracker) into a prioritized conviction dashboard with weighted sc
- [edge-strategy-designer](skills/edge-strategy-designer/SKILL.md):Convert abstract edge concepts into strategy draft variants and optional exportable ticket YAMLs for edge-candidate-agent export/validation.
- [edge-strategy-reviewer](skills/edge-strategy-reviewer/SKILL.md):Critically review strategy drafts from edge-strategy-designer for edge plausibility, overfitting risk, sample size adequacy, and execution realism.
- [exposure-coach](skills/exposure-coach/SKILL.md):Generate a one-page Market Posture summary with net exposure ceiling, growth-vs-value bias, participation breadth, and new-entry-allowed vs cash-priority recommendation by integrating signals from bre
- [finviz-screener](skills/finviz-screener/SKILL.md):Build and open FinViz screener URLs from natural language requests.
- [ftd-detector](skills/ftd-detector/SKILL.md):Detects Follow-Through Day (FTD) signals for market bottom confirmation using William O'Neil's methodology.
- [futures-position-sizer](skills/futures-position-sizer/SKILL.md):Calculate contract-based futures position sizes from a direction, entry, and stop-loss, using verified per-symbol contract specs (multiplier, tick size, tick value).
- [fxmacrodata-calendar](skills/fxmacrodata-calendar/SKILL.md):Fetch official FXMacroData macro release-calendar events for trade planning, macro regime checks, and event-risk filters.
- [ibd-distribution-day-monitor](skills/ibd-distribution-day-monitor/SKILL.md):Detect IBD-style Distribution Days for QQQ/SPY (close down at least 0.2% on higher volume), track 25-session expiration and 5% invalidation, count d5/d15/d25 clusters, classify market risk (NORMAL/CAU
- [institutional-flow-tracker](skills/institutional-flow-tracker/SKILL.md):Use this skill to track institutional investor ownership changes and portfolio flows using 13F filings data.
- [kanchi-dividend-review-monitor](skills/kanchi-dividend-review-monitor/SKILL.md):Monitor dividend portfolios with Kanchi-style forced-review triggers (T1-T5) and convert anomalies into OK/WARN/REVIEW states without auto-selling.
- [kanchi-dividend-sop](skills/kanchi-dividend-sop/SKILL.md):Convert Kanchi-style dividend investing into a repeatable US-stock operating procedure.
- [kanchi-dividend-us-tax-accounting](skills/kanchi-dividend-us-tax-accounting/SKILL.md):Provide US dividend tax and account-location workflow for Kanchi-style income portfolios.
- [macro-regime-detector](skills/macro-regime-detector/SKILL.md):Detect structural macro regime transitions (1-2 year horizon) using cross-asset ratio analysis.
- [manifoldbt-backtester](skills/manifoldbt-backtester/SKILL.md):Runs a declarative strategy spec over OHLCV bars with the manifoldbt Rust engine, pairs the fill log into round trips, and emits the eight inputs the backtest-expert skill scores.
- [market-breadth-analyzer](skills/market-breadth-analyzer/SKILL.md):Quantifies market breadth health using TraderMonty's public CSV data.
- [market-environment-analysis](skills/market-environment-analysis/SKILL.md):Comprehensive market environment analysis and reporting tool.
- [market-news-analyst](skills/market-news-analyst/SKILL.md):This skill should be used when analyzing recent market-moving news events and their impact on equity markets and commodities.
- [market-top-detector](skills/market-top-detector/SKILL.md):Assesses heuristic market top risk using O'Neil Distribution Days, Minervini Leading Stock Deterioration, and Monty Defensive Sector Rotation.
- [mt5-robot-tester](skills/mt5-robot-tester/SKILL.md):Select the best MetaTrader 5 trading robots (Expert Advisors) that have not been backtested yet, by running the MT5 Strategy Tester from the command line through a 3-round pipeline.
- [news-reaction-failure-analyzer](skills/news-reaction-failure-analyzer/SKILL.md):Judge whether a market FAILED to react to news favorable to a crowded speculative position — step 2 of Jason Shapiro's COT contrarian process.
- [options-strategy-advisor](skills/options-strategy-advisor/SKILL.md):Options trading strategy analysis and simulation tool.
- [pair-trade-screener](skills/pair-trade-screener/SKILL.md):Statistical arbitrage tool for identifying and analyzing pair trading opportunities.
- [parabolic-short-trade-planner](skills/parabolic-short-trade-planner/SKILL.md):Screen US equities for parabolic exhaustion patterns and generate conditional pre-market short plans, then evaluate intraday trigger fires from live 5-min bars.
- [pead-screener](skills/pead-screener/SKILL.md):Screen post-earnings gap-up stocks for PEAD (Post-Earnings Announcement Drift) patterns.
- [portfolio-manager](skills/portfolio-manager/SKILL.md):Comprehensive portfolio analysis using Alpaca MCP Server integration to fetch holdings and positions, then analyze asset allocation, risk metrics, individual stock positions, diversification, and gene
- [position-sizer](skills/position-sizer/SKILL.md):Calculate risk-based position sizes for long stock trades.
- [pre-trade-discipline-gate](skills/pre-trade-discipline-gate/SKILL.md):Evaluate a local pre-trade checklist before manual order entry, blocking planless, oversized, revenge-risk, market-regime-blocked, or circuit-breaker-blocked entries while journaling the decision for 
- [residual-edge-analyzer](skills/residual-edge-analyzer/SKILL.md):Separate a strategy return series into declared baseline exposure and residual edge with returns-based OLS attribution, HAC inference, rolling stability, alternate-baseline sensitivity, and regime bre
- [scenario-analyzer](skills/scenario-analyzer/SKILL.md):Skill that analyzes 18-month scenarios from a news headline.
- [sector-analyst](skills/sector-analyst/SKILL.md):This skill should be used when analyzing sector rotation patterns and market cycle positioning.
- [signal-postmortem](skills/signal-postmortem/SKILL.md):Record and analyze post-trade outcomes for signals generated by edge pipeline and other skills.
- [skill-designer](skills/skill-designer/SKILL.md):Design new Claude skills from structured idea specifications.
- [skill-idea-miner](skills/skill-idea-miner/SKILL.md):Mine Claude Code session logs for skill idea candidates.
- [skill-integration-tester](skills/skill-integration-tester/SKILL.md):Validate multi-skill workflows defined in CLAUDE.md by checking skill existence, inter-skill data contracts (JSON schema compatibility), file naming conventions, and handoff integrity.
- [stanley-druckenmiller-investment](skills/stanley-druckenmiller-investment/SKILL.md):Druckenmiller Strategy Synthesizer - Integrates 8 upstream skill outputs (Market Breadth, Uptrend Analysis, Market Top, Macro Regime, FTD Detector, VCP Screener, Theme Detector, CANSLIM Screener) into
- [stockbee-20pct-study](skills/stockbee-20pct-study/SKILL.md):Build and maintain a Stockbee-style daily 20% mover study for US equities by scanning +20%/-20% movers, classifying catalysts and setup context, updating forward outcomes, and summarizing cohort patte
- [stockbee-episodic-pivot-analyzer](skills/stockbee-episodic-pivot-analyzer/SKILL.md):Analyze Stockbee-style Day 1 Episodic Pivot candidates from earnings, guidance raises, M&A, FDA/regulatory approvals, analyst actions, major contracts, product launches, short-squeeze catalysts, or th
- [stockbee-exhaustion-hammer-screener](skills/stockbee-exhaustion-hammer-screener/SKILL.md):Screen US stocks for Stockbee-style selling-exhaustion hammer setups using prior momentum, pullback depth, undercut/reclaim, long lower-wick geometry, close-location, volume confirmation, quality/liqu
- [stockbee-momentum-burst-screener](skills/stockbee-momentum-burst-screener/SKILL.md):Screen US stocks for Stockbee-style short-term Momentum Burst setups using 4% breakout, dollar breakout, range expansion, volume expansion, prior range contraction, close-location, failure filters, an
- [stockbee-setup-fluency-trainer](skills/stockbee-setup-fluency-trainer/SKILL.md):Build a Stockbee-style setup model book from momentum-burst screener candidates, then update 3-day and 5-day forward outcomes with MFE/MAE, stop-hit status, outcome tags, and cohort statistics.
- [strategy-pivot-designer](skills/strategy-pivot-designer/SKILL.md):Detect backtest iteration stagnation and generate structurally different strategy pivot proposals when parameter tuning reaches a local optimum.
- [technical-analyst](skills/technical-analyst/SKILL.md):This skill should be used when analyzing weekly price charts for stocks, stock indices, cryptocurrencies, or forex pairs.
- [theme-detector](skills/theme-detector/SKILL.md):Detect and analyze trending market themes across sectors.
- [trade-hypothesis-ideator](skills/trade-hypothesis-ideator/SKILL.md):Generate falsifiable trade strategy hypotheses from market data, trade logs, and journal snippets.
- [trade-performance-coach](skills/trade-performance-coach/SKILL.md):Review closed trades, partial exits, and monthly trade aggregates for process adherence, risk discipline, execution quality, and evidence-based trading behavior patterns.
- [trader-memory-core](skills/trader-memory-core/SKILL.md):Track investment theses across their lifecycle — from screening idea to closed position with postmortem.
- [trading-skills-navigator](skills/trading-skills-navigator/SKILL.md):Recommend the right trading workflow, skillset, API profile, and setup path from a natural-language goal.
- [uptrend-analyzer](skills/uptrend-analyzer/SKILL.md):Analyzes market breadth using Monty's Uptrend Ratio Dashboard data to diagnose the current market environment.
- [us-market-bubble-detector](skills/us-market-bubble-detector/SKILL.md):Evaluates market bubble risk through quantitative data-driven analysis using the revised Minsky/Kindleberger framework v2.1.
- [us-stock-analysis](skills/us-stock-analysis/SKILL.md):Comprehensive US stock analysis including fundamental analysis (financial metrics, business quality, valuation), technical analysis (indicators, chart patterns, support/resistance), stock comparisons,
- [us-undervalued-growth-screener](skills/us-undervalued-growth-screener/SKILL.md):Autonomously screen NYSE, Nasdaq, and NYSE American operating-company stocks for undervalued-growth/GARP opportunities using forward same-basis valuation, driver-derived EPS/FCF forecasts, primary-sou
- [value-dividend-screener](skills/value-dividend-screener/SKILL.md):Screen US stocks for high-quality dividend opportunities combining value characteristics (P/E ratio under 20, P/B ratio under 2), attractive yields (3% or higher), and consistent growth (dividend/reve
- [vcp-screener](skills/vcp-screener/SKILL.md):Screen S&P 500 stocks for Mark Minervini's Volatility Contraction Pattern (VCP) and detect historical VCPs in a single ticker's price path.
- [weekly-performance-digest](skills/weekly-performance-digest/SKILL.md):Generate a weekly performance summary from closed trader-memory-core theses — win rate, expectancy, profit factor, R-multiple, MAE/MFE, and win/loss pattern analysis by source skill, exit reason, thes
