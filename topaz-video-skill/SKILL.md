---
name: topaz-video
description: 用本機已授權的 Topaz Video App 增強影片——放大（2×/4×）、人像修復、降噪、動畫高清、補幀/慢動作、穩定、去模糊。先預覽再匯出，結果放在原片旁。Use when the user asks to upscale, enhance, restore, denoise, stabilize, interpolate or "用 Topaz 處理" a local video file (mp4/mov/mkv/webm) on a Mac with Topaz Video installed. Supports Claude Code (AskUserQuestion) and Codex (request_user_input) panels. Not for images (use Gigapixel), not for Starlight/HDR.
---

# Topaz Video Skill

所有操作透過 `python3 <skill-dir>/scripts/tvai.py <command>`；每個命令輸出一個 JSON，`ok:false` 時讀 `error` 原樣告訴使用者，不要猜原因、不要重試同一命令。

## 不可違反的規則

1. **沒有使用者明確確認，不跑全片匯出。** `run --kind export` / `export` 必須帶 `--confirmed`，且只能在使用者於本輪選了「匯出全片」或親口說要匯出之後才加。
2. **先預覽。** 預設流程永遠是 plan → 預覽（3 秒內）→ compare 對照圖 → 使用者確認。使用者在手動面板明確選「直接匯出全片」時，仍先 `plan` 並把輸出規格與「預估需時未知」告知，等確認後才匯出。
3. **不下載、不替換。** 缺模型時回報「請在 Topaz Video App 內下載 X」。不偷偷改用其他模型，不改 Topaz 設定。
4. **授權 / 浮水印失敗即停止。** 錯誤含「授權」「浮水印」時直接回報，請使用者打開 Topaz Video App 確認登入；不要重試。
5. **每次調整都要說明改了什麼**（模型、倍率、哪個參數從多少改成多少）。
6. 一次只處理一支影片的 GPU 任務；批次請依序送出（工具內建 GPU 佇列，但不要一次塞很多）。
7. 無人值守（`claude -p`、`codex exec`、被其他 agent 呼叫、無提問工具也無法對話）時：只做到 plan + 預覽，回報結果，**絕不匯出**。

## 流程

### 0. 機器檢查（每個對話第一次使用時）
`tvai.py doctor`
- `problems` 非空 → 回報並停止。
- `note` 提到 selftest → 告知使用者後執行 `tvai.py selftest`（約 5 秒，驗證授權與無浮水印）。失敗即停止。
- 記住 `models[]` / `filters` 的可用性，面板只列可用項。

### 1. 看素材
`tvai.py inspect <video>` → 讀取回傳的 `frames[].path` 圖片，判斷：實拍/動畫/CG、有無人臉、噪點、壓縮塊、晃動、解析度與方向。

### 2. 選處理方式（面板）
需求已經明確（指定了預設/模型/倍率，或「直接幫我放大到 4K」這類可直接對應的說法）→ 跳過面板，直接到第 3 步。
否則依 [references/interaction.md](references/interaction.md) 顯示面板：
- **面板 1**：自動 (Recommended) / 手動
- 自動 → 依下表與看到的畫面選預設
- 手動 → **面板 2**（用途類別）→ **面板 3**（預設 + 執行方式）

| 素材 / 意圖 | 預設 |
|---|---|
| 一般實拍要放大（720p/1080p → 2×） | `enhance-2x` |
| 很低解析度（≤540p）或要求 4 倍 / 4K | `enhance-4x` |
| 人臉為主（訪談、自拍、人像） | `portrait` |
| 噪點多、夜景、暗光 | `denoise` |
| 素材已不錯，只要輕微提升、保真 | `fidelity` |
| 動畫、卡通、CG、遊戲畫面 | `animation` |
| 不改尺寸、只要更清晰 / 去壓縮痕跡 | `general` |
晃動 → 加 `--add stabilize`；動作拖影 → `--add deblur`；要更順 / 慢動作 → `--add interp:60` 或 `--add interp:fps=60,slowmo=2`（先確認 doctor 顯示可用）。

輸出最長邊不可超過 8192；`inspect.hints.max_scale_within_8192` 為上限。

### 3. 規劃
`tvai.py plan <video> --preset <id> [--at 秒] [--seconds 3] [覆寫…]`
- 預覽選區：挑有代表性的片段（人臉、細節多、動作多），用 `--at`；預設 3 秒。
- 把 `summary`（模型、倍率、輸入→輸出、濾鏡）與 `warnings` 用一兩句話告訴使用者。

### 4. 預覽
`tvai.py run <同 plan 參數>` → 得到 `job.id` → `tvai.py wait <id>`（最多等 540 秒；未結束就再 wait，期間回報 `percent`/`message`）。
成功後 `tvai.py compare <id>`，**先自己看對照圖**（左原片、右結果），再把圖與觀察到的差異、`estimate_export_seconds`（附上 `estimate_note`）一起給使用者，接著顯示 **面板 4**：匯出全片 / 微調或換預設 / 放棄。

### 5. 微調
口語回饋 → 參數，見 [references/tuning.md](references/tuning.md)。用 `--from-job <上一個預覽 id>` 疊加修改：
`tvai.py run --from-job <id> --set details+=0.15`
換預設：`tvai.py run --from-job <id> --preset fidelity`。每次調整都重跑預覽 + compare。

### 6. 匯出（只在使用者確認後）
`tvai.py export --from-job <預覽 id> --confirmed` → `wait` 直到完成 → 回報 `job.output`（原片同目錄 `<原檔名>_tvai_<預設>.mp4`，旁邊有 `.recipe.json`）。
長片：每次 `wait` 後簡短回報進度；使用者要停就 `tvai.py cancel <id>`。

### 其他命令
- `presets`：列出預設、類別及本機解析結果（面板選項來源）。
- `jobs` / `status <id>`：查歷史與進度。
- `save-preset <name> --from-job <id> --label "顯示名稱"`：把調好的配方存成「我的預設」。
- `prune --days 7`：清理舊預覽暫存（不影響已匯出檔案）。

## 限制（如實告知，不要承諾）
- 只支援 Apple Silicon Mac + 已登入授權的 Topaz Video App；不含 Starlight Precise/Mini、Hyperion HDR。
- selftest 通過只代表授權與輸出格式正確，不代表長片畫質或速度。
- 預估時間由預覽速度線性推算，首次載入模型會讓預估偏高。
- Codex 沙盒若擋下命令（寫入 `~/Library/Application Support/topaz-video-skill` 或原片目錄、啟動 GPU 程序），請求提升權限後重跑同一命令。
