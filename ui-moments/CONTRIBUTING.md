# 参与贡献

感谢你愿意让 UI Moments 变得更好。这份指南说明怎样提交修复、怎样新增作品，以及来源说明的要求。

## 开始之前

- 小改动（错别字、样式微调、明显的 bug）可以直接提 PR。
- 新组件、新的上游集成或较大的重构，请先开一个 [issue](https://github.com/guanmo-ai/ui-moments/issues/new/choose) 说明想法，避免重复劳动。
- 参与即表示同意遵守[行为准则](CODE_OF_CONDUCT.md)。

## 本地开发

```bash
npm run setup
```

```bash
npm run dev
```

提交前请运行：

```bash
npm run build && npm run lint && npm test
```

```bash
git add -A && npm run package:site && npm run test:browser
```

`package:site` 只打包 Git 已跟踪的文件，所以新文件要先 `git add`。

## 新增一个作品

1. **选位置。** 原创控件加到 [`gallery/originals/index.html`](gallery/originals/index.html)；独立作品新建 `gallery/<作品名>/`，包含可操作的 `index.html` 和 `README.md`。
2. **支持嵌入。** 页面引入 `../../assets/embed.js`，在 `?embed=ui` 下只显示舞台；遵守 `data-theme`、`data-gallery-active="false"`（停止动画）与 `prefers-reduced-motion`。
3. **登记。** 在 [`gallery/works.js`](gallery/works.js) 加一项（`id`、`title`、`en`、`summary`、`tags`、`demo`、`source`，参考作品还要写 `credit`），并在 [`assets/catalog.mjs`](assets/catalog.mjs) 确认分类与排序。
4. **写清来源。** 在作品 README 和 [CREDITS.md](CREDITS.md) 里写明来源类型（见下文）。
5. **补测试。** 在 `tools/site.test.mjs` 或 `tools/browser.test.mjs` 覆盖新作品的关键交互。

### 组件质量清单

- [ ] 鼠标、触摸和键盘都能完成主要操作，使用正确的 ARIA 角色。
- [ ] 深色与浅色主题下对比度足够。
- [ ] 开启「减少动态效果」时功能完整，只去掉非必要动画。
- [ ] 卡片尺寸（约 170×110 到 250×160）与详情大尺寸下都好看。
- [ ] 不加载外部字体、脚本或图片。
- [ ] 控制台没有错误。

## 来源与许可（必读）

完整规则见 [docs/attribution.md](docs/attribution.md)。简要地说：

| 类型 | 可以做什么 | 必须写明 |
| --- | --- | --- |
| **原创** | 自己构思与实现，可使用 AI 辅助 | 无外部来源 |
| **开源完整集成** | 按许可证使用上游代码，原样放进 `vendor/` 并固定版本 | 作者、仓库、版本或提交、许可证全文、我们做了什么 |
| **参考后实现** | 只借鉴想法；代码、图形、素材全部自己做 | 参考对象链接、借鉴了什么、我们自己做了什么 |

**不接受：** 没有许可证的代码或素材；SF 字体、SF Symbols、Polaris 代码等受限内容；任何公司的商标；与原作几乎一样的复刻（除非原作者书面同意）。

## 提交规范

- 一个 PR 只做一件事，描述里写清楚改了什么、为什么。
- 提交信息用简洁的中文或英文祈使句，例如「新增潮汐进度控件」「Fix dial keyboard range」。
- UI 改动请附截图或录屏（深色和浅色各一张更好）。
