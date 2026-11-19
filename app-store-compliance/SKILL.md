---
name: app-store-compliance
description: mjmirza/app-store-compliance - App Store and Google Play rejection-avoidance playbook: documented rejection patterns with guideline citations, detection and fixes, regulatory deadlines, and a pre-submission audit. Use before submitting or updating any iOS or Android app.
license: LicenseRef-OpenRoots-ORA-2.3
---
来源:https://github.com/mjmirza/app-store-compliance (2026-11-19 ET 核实,上游提交 d2156ba,版本 2.4.0).Trendshift 2026-11-18 每日榜发现,用户 2026-11-19 09:19 ET 点头入库.

# App Store 与 Google Play 上架合规自查

提交前怎么做合规自查才不被拒审:拒审模式库 (每条附审核条款,检测方法,修复办法),合规截止日 (EU AI Act,DSA,COPPA 等),提交前审计流程.

## 许可证 (先看)

上游不是标准开源许可证,是 OpenRoots Agent License 2.3 (GitHub 显示 Other):个人,非营利,学校,政府以及年收入 2,000 万美元以下的主体免费无条件使用;超过门槛按超出部分 0.5% 计,封顶每年 25 万美元.全文见本目录 `LICENSE`,`NOTICE`.舰队用途在免费档内.

## 前提

- 只读方法:无需安装.
- 上游另有提交前自动拦截脚本 (bash guard,需 git + bash),本库没收;要用装上游.

## 怎么用

1. 读 `skill/SKILL.md` (上游技能正文),按它的流程走.
2. 审计命令说明见 `commands/app-store-audit.md`.
3. 查具体条款读 `references/` (20 篇);数据在 `data/`:rejection-patterns.json (拒审模式),regulatory-deadlines.json (合规截止日),detection-recipes.json (检测配方),ruling-register.json (裁决记录).
4. 给审核员写备注用 `templates/REVIEW-NOTES-TEMPLATE.md`.

## 注意

- 截止日与审核条款会变,上游数据截至其版本发布日;用之前对照 Apple,Google 官方现行条款核实,不把库里的日期当今天已核实的事实.
- 适用平台:正文按 Claude Code 等 AI coding 工具写,其他 AI 照方法用,跳过 hook 安装步骤.
