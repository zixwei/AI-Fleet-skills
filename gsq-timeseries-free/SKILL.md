---
name: gsq-timeseries-free
description: >-
  Use when computing free, offline analytics on a user-supplied price series
  with gs_quant.timeseries (volatility, max drawdown, z-scores, beta,
  correlation, RSI, moving averages, Bollinger bands, MACD) — no Goldman Sachs
  account needed.
---

## 运行前提(给其他 AI)

- 依赖与授权:不需要高盛账号,也不建立 GsSession.只对调用者自备的价格序列做本地计算.`Dataset`,资产查询和行情拉取不是本技能,那些要 Marquee 账号.
- 输入 / 输出 / 入口:日期索引的收盘价序列.指定解释器 `/workspace/stock-skills/gs-quant/.venv/bin/python`.输出波动率,回撤,beta,RSI 等.函数表在正文.
- 未知:其他环境是否装有 gs_quant 2.2.1,未知.没有该库时不要假装已经装好.
- 库内入口:函数表就在本文件,没有另附完整指南.缺失依赖:`/workspace/stock-skills/gs-quant/.venv` 与 `/workspace/stock-skills/gs-quant/smoke_test.py` 不在本仓库.不得假定其他 AI 可访问 `/workspace`.本文件不是含解释器的自足完整版.
- 环境不符:请 ai总管安排具备该库的成员执行.读到方法不等于已经具备能力.

> Not part of Goldman Sachs' bundled skills; written from the gs_quant 2.2.1 source and a verified offline smoke test (`/workspace/stock-skills/gs-quant/smoke_test.py`). Run only with `/workspace/stock-skills/gs-quant/.venv/bin/python`.

# Free local analytics with `gs_quant.timeseries`

Pure pandas/numpy math on a `pd.Series` indexed by date. No network calls, no GsSession needed.

## Getting data in
Bring your own prices: a CSV, the user's file, or another data skill (`global-stock-data`, `a-stock-data`, `easy-tdx`). gs_quant has **no free market data**; `Dataset`, `get_data` and asset lookups need a Marquee account.

```python
import pandas as pd
from gs_quant.timeseries import (Window, returns, volatility, exponential_volatility, max_drawdown,
    zscores, beta, correlation, relative_strength_index, moving_average, exponential_moving_average,
    bollinger_bands, macd)
px = pd.read_csv('prices.csv', index_col=0, parse_dates=True)['close']
bench = pd.read_csv('bench.csv', index_col=0, parse_dates=True)['close']
```

## Verified-free functions
| Call | Returns |
|---|---|
| `returns(px)` | simple returns (`type=Returns.LOGARITHMIC` for log) |
| `volatility(px, Window(22, 0))` | rolling annualized vol in percent (20.6 = 20.6%) |
| `exponential_volatility(px, 0.9)` | EWMA vol in percent |
| `max_drawdown(px)` | running max drawdown as a fraction (-0.18 = -18%) |
| `zscores(px, Window(22, 0))` | rolling z-score |
| `beta(stock, bench, Window(60, 0))` | rolling beta (inputs are prices) |
| `correlation(a, b, Window(60, 0))` | rolling correlation of returns |
| `relative_strength_index(px, 14)` | RSI 0-100 (there is no `rsi` alias) |
| `moving_average(px, Window(20, 0))` | simple moving average |
| `exponential_moving_average(px, 0.9)` | EMA |
| `bollinger_bands(px, Window(20, 0), k=2)` | DataFrame of lower/upper bands |
| `macd(px, 12, 26, 9)` | MACD line |

`Window(w, r)`: w = window size (int obs or `'1m'`), r = ramp-up obs to drop. `Window(22, 0)` keeps early values.

## NOT free (need GsSession / Marquee credentials)
- `sharpe_ratio(...)` fetches a risk-free curve from GS. Free alternative: `returns(px).mean()/returns(px).std()*252**0.5`.
- Any function taking an `asset`, `report_id` or `Dataset`.
- Everything in `gsq-pricing`, `gsq-datasets`, `gsq-backtesting`, `gsq-results`.

## Example
```bash
/workspace/stock-skills/gs-quant/.venv/bin/python - <<'PY'
import pandas as pd
from gs_quant.timeseries import volatility, max_drawdown, Window
px = pd.read_csv('prices.csv', index_col=0, parse_dates=True)['close']
print('22d vol %:', round(volatility(px, Window(22, 0)).iloc[-1], 2))
print('max drawdown %:', round(100*max_drawdown(px).iloc[-1], 2))
PY
```
Report results in plain language for a non-technical user. This is analysis, not investment advice.
