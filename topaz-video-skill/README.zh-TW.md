# Topaz Video Skill

[English](README.md) · **繁體中文**

讓 **Claude Code** 與 **Codex** 透過對話，使用你 Mac 上**已授權的 Topaz Video App** 處理影片：放大、人像修復、降噪、動畫高清、補幀/慢動作、穩定、去模糊。

流程是「先預覽、看對照圖、確認後才匯出」。結果放在原片旁邊，附上可重現的配方檔。

![Topaz Video Skill 總覽](assets/overview.png)

## 目錄

- [為什麼要做這個](#為什麼要做這個)
- [需求](#需求)
- [安裝](#安裝)
- [怎麼用](#怎麼用)
- [互動面板](#互動面板)
- [內建預設](#內建預設)
- [口語微調](#口語微調)
- [命令參考](#命令參考)
- [安全設計](#安全設計)
- [架構](#架構)
- [狀態、輸出與環境變數](#狀態輸出與環境變數)
- [限制](#限制)
- [疑難排解](#疑難排解)
- [開發](#開發)
- [致謝與授權](#致謝與授權)

## 為什麼要做這個

Topaz Video 的效果很好，但每次都要開 GUI、挑模型、調參數、等匯出。這個 skill 把這些工作交給 Agent：

- **用講的**：「把這段婚禮影片修清楚、放到 4K」。Agent 會看畫面、選預設，先跑 3 秒預覽給你看。
- **不怕做錯**：參數錯誤在規劃階段就擋下；沒有你的確認，不會開跑耗時的全片匯出。
- **不會偷偷變差**：只要授權沒有被推理程序接受，或出現浮水印回退，就拒絕輸出。
- **可攜**：任何一台已授權的 Apple Silicon Mac，`git clone` 後執行 `./install.sh` 就能用，不需要額外的服務或套件。

## 需求

| 項目 | 說明 |
|---|---|
| 硬體 | Apple Silicon Mac（模型是 CoreML 格式） |
| Topaz Video | 已安裝在 `/Applications/Topaz Video.app`、已登入授權，並在 App 內下載過要用的模型 |
| Python | `python3`，macOS 內建的 3.9 即可，不需要任何第三方套件 |
| Agent | Claude Code，或 Codex（App / CLI） |

開發與驗證環境：Topaz Video **1.7.1**、macOS 27、M2 Max。

## 安裝

```bash
git clone https://github.com/DreamLoveBetty/topaz-video-skill.git ~/Projects/topaz-video-skill
cd ~/Projects/topaz-video-skill
./install.sh
```

`install.sh` 會用 symlink 安裝到：

- `~/.claude/skills/topaz-video`（Claude Code）
- `~/.codex/skills/topaz-video`（Codex，會遵守 `CODEX_HOME`）

之後在 repo 執行 `git pull`，兩邊會同時更新。只裝一邊：`./install.sh claude` 或 `./install.sh codex`。移除：`./install.sh --uninstall`（只刪 symlink）。

在新機器上第一次使用前：

```bash
python3 scripts/tvai.py doctor          # App、授權、模型、濾鏡是否可用
python3 scripts/tvai.py selftest        # 約 5 秒：授權 checkout、無浮水印、輸出驗收
python3 scripts/tvai.py selftest --all  # 可選：測試所有可用模型與倍率（約 1 分鐘）
```

## 怎麼用

直接對 Agent 說，例如：

> 用 Topaz 把 ~/Movies/婚禮.mp4 放大到 4K
>
> 這段夜景影片噪點好多，幫我處理一下
>
> 把 ~/Desktop/demo.mov 補到 60 幀，先給我看預覽

Agent 會依照 [SKILL.md](SKILL.md) 的流程進行：

1. **機器檢查**：`doctor`，新機器會再跑 `selftest`。
2. **看素材**：`inspect` 從影片抽出三張畫面，Agent 判斷是實拍還是動畫、有沒有人臉、噪點、晃動。
3. **選擇處理方式**：用面板讓你選「自動」或「手動」。需求已經講清楚時會跳過這一步。
4. **規劃與預覽**：`plan` 校驗參數後，用 `run` 在背景跑 3 秒預覽。
5. **對照與微調**：`compare` 產生前後對照圖，並附上全片的預估時間。不滿意就用口語說，Agent 會把它轉成參數後重新預覽。
6. **確認後匯出**：你同意後才執行 `export --confirmed`，輸出到原片旁邊。

![預覽對照圖](assets/compare.jpg)

> 上圖是 `compare` 指令的實際輸出：320×180 的合成碎形素材，經 Rhea 4× 放大。碎形不是自然影像，所以這張圖只用來說明對照圖的格式，不代表真實畫質。

## 互動面板

![互動面板](assets/panels.png)

兩個宿主顯示相同的面板內容，只是呼叫的工具不同：

| 宿主 | 工具 | 備註 |
|---|---|---|
| Claude Code | `AskUserQuestion` | 隨時可用 |
| Codex | `request_user_input` | 預設只在 Plan 模式可用，見下方說明 |
| 兩者皆無 | 編號文字選單 | 題目與選項相同 |

面板依兩者的共同上限設計：每題最多 3 個選項、每次最多 2 題。推薦的選項排在第一個並標示 `(Recommended)`，「其他」自由輸入由宿主自動附加。完整的 JSON 規格見 [references/interaction.md](references/interaction.md)。

### Codex 的預設模式面板

Codex 的 `request_user_input` 預設只在 Plan 模式提供，但 Plan 模式是唯讀的，不能執行 GPU 任務。所以 skill 在 Codex 中找不到這個工具時：

1. 用 `scripts/bootstrap_interaction.py --json` 唯讀檢查目前狀態。
2. 狀態為 `disabled` 時，用一句文字詢問你是否同意修改 `~/.codex/config.toml`，加上 `[features] default_mode_request_user_input = true`。
3. 你同意後才修改：先備份、寫入、驗證，失敗會自動還原。完成後提醒你**完整重啟 Codex**。
4. 當次對話繼續用文字選單把影片處理完。你拒絕的話，本次對話就不會再問。

## 內建預設

每個預設都是一條「候選鏈」：skill 會依序挑出這台 Mac 上第一個可用的模型與倍率，所以不同機器下載的模型不一樣也沒關係。

| 預設 | 類別 | 用途 | 候選（依序） |
|---|---|---|---|
| `enhance-2x` 高清 2× | 放大 | 通用放大 | Artemis 2× → Rhea 2× → Theia 2× → Gaia 2× |
| `enhance-4x` 高清 4× | 放大 | 低解析度大幅放大 | Rhea 4× → Proteus 4× |
| `portrait` 人像修復 | 修復 | 臉部與低質素材 | Iris 1× |
| `denoise` 強力降噪 | 修復 | 夜景、暗光、顆粒 | Nyx 1× → Nyx 2× |
| `fidelity` 高保真 | 修復 | 輕修復、保持原貌 | Theia 2× → Theia 1× |
| `animation` 動畫高清 | 特定素材 | 動畫、卡通、CG | Gaia Animation 2× → Gaia 2× |
| `general` 通用增強 | 特定素材 | 不改尺寸，只增強 | Proteus 1× → Rhea 1× |

另外可以疊加的濾鏡（依各機器實際下載的模型而定）：

- `--add denoise`（Nyx 3）
- `--add interp:60`（Chronos / Apollo 補幀）
- `--add stabilize`（CPE / Refine）
- `--add deblur`（Themis）

調好的配方可以用 `save-preset` 存成「我的預設」，之後在面板中就會出現。

## 口語微調

| 你說 | Agent 會先試 |
|---|---|
| 還是糊 | `--set details+=0.2` |
| 噪點多 | `--set noise+=0.2` 或 `--add denoise:noise=0.3` |
| 塑膠感、像磨皮 | `--set details+=0.15 --set blend=0.15` |
| 壓縮方塊 | `--set compression+=0.3` |
| 邊緣光暈 | `--set halo+=0.2` |
| 畫面晃 | `--add stabilize` |
| 動作拖影 | `--add deblur` |
| 要 60 幀 / 慢動作 | `--add interp:60` / `--add interp:fps=0,slowmo=2` |

這些都是起始經驗值，不是 Topaz 官方建議；每次調整後都會重跑預覽並附上對照圖。完整對照見 [references/tuning.md](references/tuning.md)。

## 命令參考

所有命令都是 `python3 scripts/tvai.py <command>`，每次輸出一個 JSON 物件；`ok:false` 時 `error` 欄位會說明原因。

| 命令 | 用途 | 用到 GPU |
|---|---|---|
| `doctor` | App、授權、模型與濾鏡的可用性，以及本機驗證紀錄 | 否 |
| `selftest [--all \| --model M]` | 用合成短片驗證授權 checkout、無浮水印與輸出驗收 | 是（數秒） |
| `presets` | 預設、類別與這台機器上的解析結果；也是面板選項的來源 | 否 |
| `inspect <video>` | 影片規格加三張抽幀 | 否 |
| `plan <video> --preset P [...]` | 試算：解析出的模型、輸出規格、校驗錯誤 | 否 |
| `run <video> --preset P [...]` | 在背景跑預覽，回傳 job id | 是 |
| `run --from-job ID [...]` | 以上一個 job 的配方為基礎覆寫後再跑 | 是 |
| `export --from-job ID --confirmed` | 匯出全片（必須帶 `--confirmed`） | 是 |
| `wait ID [--timeout 540]` | 等待，回傳進度或結果 | 否 |
| `status [ID]` / `jobs` | 查詢單一 job 或最近的 job | 否 |
| `compare ID [--count 3]` | 前後對照圖（左原片、右結果） | 否 |
| `cancel ID` | 取消，並終止整個程序群組 | 否 |
| `save-preset NAME --from-job ID` | 把配方存成自訂預設 | 否 |
| `prune [--days 7]` | 清理舊的 job 暫存，不影響已匯出的檔案 | 否 |

常用的覆寫參數：

- `--model` / `--scale`
- `--set key=v`、`key+=d`、`key-=d`（參數：`preblur noise details halo blur compression prenoise blend grain gsize`）
- `--add` / `--remove` 濾鏡
- `--encode h264|hevc|hevc10`、`--audio aac|mute`、`--bitrate Mbps`
- `--at 秒`、`--seconds 長度`

## 安全設計

| 閘門 | 行為 |
|---|---|
| 授權 checkout | 每個使用模型的處理階段，日誌中都必須出現 owned license checkout，否則拒絕輸出 |
| 浮水印回退 | 偵測到浮水印回退訊息就失敗 |
| 輸出驗收 | 幀數、尺寸、幀率（與補幀設定）完全相符才發布 |
| 不下載 | 所有 Topaz 濾鏡都帶 `download=0`；缺模型時請你在 App 內下載 |
| 不碰授權 | 只定位 `license.lic` 所在的目錄並傳給 Topaz 的 ffmpeg，不讀取也不複製內容 |
| 匯出確認 | `export` 沒有 `--confirmed` 會被拒絕；SKILL.md 規定只能在使用者明確同意後才加上 |
| 無人值守 | 只做到預覽，不匯出 |
| 不覆蓋 | 輸出檔名衝突時自動加上 `_2`、`_3` |

## 架構

![架構](assets/architecture.png)

```
topaz-video-skill/
├── SKILL.md                    # Agent 流程與硬性規則
├── references/
│   ├── interaction.md          # 面板 JSON 規格、Codex 自舉流程
│   └── tuning.md               # 口語 → 參數對照
├── presets/builtin.json        # 7 個內建預設與 3 個類別
├── scripts/
│   ├── tvai.py                 # CLI 入口
│   ├── bootstrap_interaction.py  # Codex 預設模式面板自舉（MIT，第三方）
│   └── tvai_core/
│       ├── catalog.py          # 模型、參數、濾鏡定義
│       ├── discovery.py        # 找 App、授權、veaiDataFolder、已下載權重
│       ├── contracts.py        # 配方校驗
│       ├── presets.py          # 候選鏈解析、覆寫合併
│       ├── pipeline.py         # FFmpeg 指令規劃（純函式）
│       ├── runner.py           # 執行、閘門、驗收
│       ├── jobs.py             # job 狀態、背景 worker、GPU 鎖、發布
│       └── media.py            # 探測、抽幀、對照圖
├── tests/                      # 可攜測試 + 與 CanvasHub 的一致性測試
├── agents/openai.yaml          # Codex 顯示名稱與預設提示
└── install.sh
```

## 狀態、輸出與環境變數

- **輸出**：原片同目錄下的 `<原檔名>_tvai_<預設>.mp4`，旁邊附 `.recipe.json`（完整配方、App 版本、驗收資訊）。
- **狀態**：`~/Library/Application Support/topaz-video-skill/`，包含 jobs、自訂預設、抽幀，以及依 App 版本分開記錄的 `verified.json`。升級或重新複製 skill 都不會遺失。

| 環境變數 | 用途 |
|---|---|
| `TVAI_APP` | Topaz Video.app 不在預設位置時指定 |
| `TVAI_MODEL_DATA_DIR` | 覆寫模型下載資料夾（預設讀取 App 偏好設定中的 `veaiDataFolder`） |
| `TVAI_LICENSE_DIR` | 覆寫含 `license.lic` 的目錄 |
| `TVAI_STATE_DIR` | 覆寫狀態目錄 |

## 限制

- 只支援 Apple Silicon Mac 加上已授權的 Topaz Video。
- **不支援** Starlight Precise / Mini 與 Hyperion 2 HDR，因為它們需要另外驗證的 Neuroserver 運行環境（規劃在第二期）。
- 每個模型的倍率清單沿用 Topaz Video 1.7.1 上驗證過的組合；其他 App 版本請先跑 `selftest --all`。
- `selftest` 通過只代表授權與輸出格式正確，不代表長片的畫質或速度。
- 預估時間是用預覽速度線性推算的，首次載入模型會讓預估偏高。
- 單一選區最長 600 秒；`export` 預設處理到片尾。輸出最長邊不可超過 8192 px。

## 疑難排解

| 訊息 | 處理方式 |
|---|---|
| 找不到 Topaz Video App | 確認安裝路徑，或設定 `TVAI_APP` |
| 找不到已啟用的授權 / 授權未被接受 | 打開 Topaz Video App 確認已登入，再跑 `selftest` |
| 請在 Topaz Video App 內下載 X | 在 App 內用該模型處理一次，或從 App 的模型管理下載 |
| 缺少適配此畫面尺寸的 CoreML 變體 | 在 App 內用同一模型處理一次相同方向（直式/橫式）的素材 |
| 輸出尺寸超過 8192 | 改用較小倍率 |
| Codex 沙盒擋下命令 | 允許該命令以提升權限執行（需要寫入狀態目錄、原片目錄，並啟動 GPU 程序） |
| `bootstrap_interaction.py` 回報 error | 改用文字選單即可；或手動在 `config.toml` 的 `[features]` 加上 `default_mode_request_user_input = true` |

## 開發

```bash
python3 -m unittest discover -s tests          # 可攜測試，不需要 Topaz
CANVASHUB_ROOT=/path/to/CanvasHub \
  python3 -m unittest discover -s tests        # 加上與 CanvasHub 的指令一致性檢查
```

`tvai_core/pipeline.py` 移植自 CanvasHub `backend/topaz_video`（commit `1587d6d`）。兩邊**不共用程式碼**；`tests/test_canvas_parity.py` 會逐字比對兩邊產生的 FFmpeg 參數。任何一邊修了 Topaz 指令相關的 bug，這個測試就會失敗，提醒另一邊評估是否要跟進。

## 致謝與授權

- 本專案以 [MIT License](LICENSE) 授權。
- `scripts/bootstrap_interaction.py` 取自 [interactive-project-skill](https://github.com/DreamLoveBetty/interactive-project-skill)（MIT），詳見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
- Topaz Video 是 Topaz Labs 的產品。本專案與 Topaz Labs 沒有任何關係，不包含也不散布 Topaz 的程式、模型或授權檔。使用時需要你自己合法取得的 Topaz Video 授權。
