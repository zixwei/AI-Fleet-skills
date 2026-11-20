# 互動面板規格

兩個宿主共用同一份面板內容；只換呼叫的工具。以**實際可呼叫的工具**判斷，不要依模式名稱猜。

| 宿主 | 工具 | 上限 |
|---|---|---|
| Claude Code | `AskUserQuestion` | 每次 ≤4 題、每題 2–4 選項 |
| Codex | `request_user_input` | 每次 ≤3 題、每題 2–3 選項，`id` 用 snake_case |
| 兩者皆無 | 編號文字選單 | 一次只問一件事 |

本 skill 一律按共同上限設計：**每題 ≤3 選項、每次 ≤2 題**；`header` ≤12 字；推薦項放第一個並在 label 後加 ` (Recommended)`；不要自己加「其他」，兩個工具都會自動附上自由輸入。

## Codex：工具不可用時

Codex 預設只在 Plan 模式提供 `request_user_input`，但 Plan 模式是唯讀的，不能跑 GPU 任務，所以本 skill 需要 Default 模式也能用面板。

1. 執行只讀檢查：`python3 <skill-dir>/scripts/bootstrap_interaction.py --json`
2. `status` 為 `disabled` → 用**一個純文字問題**取得明確同意：
   > 目前 Codex 的預設模式沒有開啟選單面板。要不要由我備份並修改 Codex 全域設定（`~/.codex/config.toml` 加上 `default_mode_request_user_input = true`）？重啟 Codex 後生效；這次先用文字選單繼續。
   呼叫本 skill 不等於同意改全域設定。
3. 同意 → `python3 <skill-dir>/scripts/bootstrap_interaction.py --apply --json`，回報 `backup_path` 並提醒**完整重啟 Codex**。當前任務的工具集不會熱更新：**這次繼續用文字選單完成**，不要宣稱面板已可用。
4. `enabled`（但工具仍不可用）→ 提醒完整重啟 Codex；`unsupported` / `overridden` / `error` → 不改設定，直接用文字選單。使用者拒絕後本對話不再詢問。

工具回傳 `{"answers":{}}`（使用者關閉面板）→ 改用文字問同一題一次；仍無回應就停在目前步驟。

## 面板 1：處理方式

Claude Code：
```json
{"questions":[{"header":"處理方式","question":"要讓我分析素材自動選設定，還是你自己選預設？","multiSelect":false,
  "options":[
    {"label":"自動 (Recommended)","description":"我看過畫面後選預設，先預覽 3 秒並附對照圖，你確認後才匯出。"},
    {"label":"手動","description":"你從這台 Mac 可用的預設中自己挑。"}]}]}
```
Codex：同內容，每題加 `"id":"run_mode"`，移除 `multiSelect`。

## 面板 2：用途（手動）

選項來自 `tvai.py presets` 的 `categories`，只列**至少有一個可用預設**的類別。若有「我的預設」（`mine`）而類別超過 3 個，把 `special` 與 `mine` 合併成一個選項「特定素材 / 我的預設」。

```json
{"questions":[{"header":"用途","question":"這支影片主要想做什麼？","multiSelect":false,
  "options":[
    {"label":"放大","description":"提高解析度：高清 2× / 高清 4×。"},
    {"label":"修復","description":"人像修復 / 強力降噪 / 高保真，可維持尺寸。"},
    {"label":"特定素材","description":"動畫高清 / 通用增強（不改尺寸）。"}]}]}
```
Codex：`"id":"category"`。只剩 1 個可用類別時跳過本面板並告知。

## 面板 3：預設與執行方式（同一次提問兩題）

Q1 選項 = 該類別中 `available:true` 的預設（≤3）；description 用 `presets[].resolved` 組成：`<模型> · <倍率>× · 輸出 <寬>×<高><（本機已驗證）>`。輸出尺寸 = inspect 的寬高 × 倍率。類別內超過 3 個時列最常用的 2 個 + 「列出全部」，選後改用文字清單。只剩 1 個可用預設時不問 Q1，直接採用並告知。

```json
{"questions":[
  {"header":"預設","question":"要用哪個預設？","multiSelect":false,
   "options":[
     {"label":"高清 2× (Recommended)","description":"Artemis High Quality v12 · 2× · 輸出 2560×1440（本機已驗證）"},
     {"label":"高清 4×","description":"Rhea v1 · 4× · 輸出 5120×2880"}]},
  {"header":"執行方式","question":"先預覽一小段，還是直接匯出整支？","multiSelect":false,
   "options":[
     {"label":"先預覽 3 秒 (Recommended)","description":"約數十秒完成並附對照圖，滿意再匯出。"},
     {"label":"直接匯出全片","description":"跳過預覽；我會先告知輸出規格，再請你確認一次。"}]}]}
```
Codex：兩題分別 `"id":"preset"`、`"id":"execution"`。

## 面板 4：預覽結果（自動與手動共用）

先附對照圖與觀察，再問：
```json
{"questions":[{"header":"下一步","question":"預覽效果如何？","multiSelect":false,
  "options":[
    {"label":"匯出全片 (Recommended)","description":"沿用這組設定處理整支影片，預估約 N 分鐘。"},
    {"label":"微調或換預設","description":"說說哪裡不滿意（例如太塑膠、還是糊），我調整後重新預覽。"},
    {"label":"放棄","description":"不輸出任何檔案，保留預覽暫存可之後清理。"}]}]}
```
Codex：`"id":"next_step"`。使用者在「其他」直接寫的口語回饋，視同選了「微調」，依 tuning.md 轉換。

## 文字選單後備格式

```
要怎麼處理這支影片？
1. 自動（推薦）：我看過畫面後選設定，先預覽 3 秒，你確認後才匯出
2. 手動：你自己從可用預設中挑
回覆數字，或直接描述你的需求。
```
