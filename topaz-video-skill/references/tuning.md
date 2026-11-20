# 口語回饋 → 參數

這些是**起始經驗值**，不是 Topaz 官方建議；每次調整都要重跑預覽並看 compare 對照圖確認。參數預設都是 0（中性），範圍見 `tvai.py presets` 的 `parameters`。

| 使用者說 | 第一步 | 仍不夠時 |
|---|---|---|
| 還是糊、不夠清楚 | `--set details+=0.2` | `--set blur+=0.1`（Topaz 的 blur 參數 = 銳化） |
| 噪點多、顆粒雜訊 | `--set noise+=0.2` | `--add denoise:noise=0.3`（Nyx 3 獨立降噪） |
| 塑膠感、太平滑、像磨皮 | `--set details+=0.15 --set blend=0.15` | `--set grain=0.05`（加一點顆粒） |
| 壓縮方塊、色塊 | `--set compression+=0.3` | 改用 `general` 或 `fidelity` 預設 |
| 邊緣白邊 / 光暈 | `--set halo+=0.2` | 降低 `blur` |
| 鋸齒、邊緣毛躁 | `--set preblur+=0.2` | — |
| 太銳、過度處理、不自然 | `--set blend=0.25` | 換 `fidelity` 預設 |
| 畫面晃 | `--add stabilize` | `--add stabilize:mode=full_frame`（需 Refine 2）、`strength=10` |
| 動作拖影 | `--add deblur` | — |
| 想更順 / 60 幀 | `--add interp:60` | `--add interp:fps=60,model=apo-8` |
| 慢動作 | `--add interp:fps=0,slowmo=2` | slowmo 最多 16 |
| 檔案太大 | `--bitrate 20` | `--encode hevc` |
| 要給剪輯軟體 / 更高畫質 | `--encode hevc10` | — |
| 不要聲音 | `--audio mute` | — |

語法：`key=值` 直接設定、`key+=差值` / `key-=差值` 相對調整（超出範圍自動夾住並在 `warnings` 回報）。移除濾鏡：`--remove interp`。

調整後告訴使用者「改了什麼、從多少到多少」，例如：「details 0 → 0.2、加了 15% 原片混合，降低塑膠感」。
