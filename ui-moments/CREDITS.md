# 致谢与来源 · Credits

UI Moments 用到的每一个外部仓库、字体、依赖和灵感来源都列在这一页。

- 想知道**某个作品是谁做的**：看下面的「作品来源总表」。
- 想看**许可证原文**：见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，以及各 `vendor/` 目录里随附的 `LICENSE`。
- 想知道**我们怎样判断能不能用**：见 [docs/attribution.md](docs/attribution.md)。
- 参考想法的作品不在本页逐条列出，来源写在每个作品的 `credit` 字段里，见第 5 节。

> 根目录 [LICENSE](LICENSE)（MIT）只覆盖 UI Moments 自己写的代码，**不会**替换或覆盖任何上游作者的版权与许可。

---

## 1. 作品来源总表

| 来源类型 | 数量 | 作品 | 代码归属 | 许可 |
| --- | ---: | --- | --- | --- |
| **UI Moments 原创** | 64 | 37 个原创控件、18 款原创加载动效、9 款加载微动效 | UI Moments | MIT |
| **开源完整集成** | 149 | LDRS 44 款、Loading UI 47 款、SVG Spinners 46 款、Micron.js 12 款 | 各上游作者 | MIT（保留原文） |
| **参考想法后独立实现** | 19 | 昼夜开关、弹性滑尺、对齐拨片、夹页键；7 个参考 amicro 的 Motion 作品；8 个参考 @yui540 视觉语言的 Elastic 作品 | UI Moments | MIT |
| **合计** | **232** | | | |

画廊卡片会分别标注「原创」「×× 开源」「参考后实现」。打开详情后能看到来源链接和许可。

---

## 2. 收录在仓库里的第三方代码

这些文件**原样**保存在仓库中，固定了版本或提交，保留完整许可证。我们的改动只在外层：浏览、分类、参数面板、导出与无障碍。

| 项目 | 作者 | 固定版本 | 位置 | 许可 | 我们用它做什么 |
| --- | --- | --- | --- | --- | --- |
| [LDRS](https://github.com/GriffinJohnston/ldrs) | Griffin Johnston / UI Ball | npm `ldrs@1.1.9`（SHA-512 见 `source.json`） | `gallery/loaders/vendor/ldrs/` | [MIT](gallery/loaders/vendor/ldrs/LICENSE) | 44 款加载动效的预览、调参与 HTML / React 导出 |
| [Loading UI](https://github.com/turbostarter/loading-ui) | Bartosz Zagrodzki | 提交 `1b5348c` | `gallery/loading-ui/vendor/loading-ui/` | [MIT](gallery/loading-ui/vendor/loading-ui/LICENSE.md) | 47 款加载动效，构建为本地运行时 |
| [SVG Spinners](https://github.com/n3r4zzurr0/svg-spinners) | Utkarsh Verma | 提交 `abfa05c` | `gallery/svg-spinners/vendor/svg-spinners/` | [MIT](gallery/svg-spinners/vendor/svg-spinners/LICENSE) | 46 款 SVG 动效的预览、着色与导出 |
| [Micron.js](https://github.com/webkul/micron) | Webkul | 提交 `c46d1bd` | `gallery/micron/vendor/micron/` | [MIT](gallery/micron/vendor/micron/LICENSE) | 12 款点击反馈的按钮演示与导出 |
| [Geist / Geist Mono](https://github.com/vercel/geist-font) | Vercel | latin 可变字重子集 | `assets/fonts/` | [SIL OFL 1.1](assets/fonts/OFL-Geist.txt) | 全站界面字体（自托管） |

每一份导出的 HTML、React 示例和复刻提示词都会附带对应作品的作者与完整许可证。

## 3. 打包进网站的运行时依赖

Loading UI 需要 React 运行。构建脚本 `gallery/loading-ui/tools/build.mjs` 把下列包打进 `gallery/loading-ui/dist/runtime.js`，并把它们的完整许可写入 `gallery/loading-ui/dist/THIRD_PARTY_LICENSES.txt`：

`react`、`react-dom`、`scheduler`（Meta，MIT）· `motion`、`framer-motion`、`motion-dom`、`motion-utils`（Framer / Motion，MIT）· `clsx`（Luke Edwards，MIT）· `tailwind-merge`（Dany Castillo，MIT）· `tailwindcss`（Tailwind Labs，MIT）

## 4. 只在开发与构建时使用的工具

不会出现在发布的网站里：

| 工具 | 用途 | 许可 |
| --- | --- | --- |
| [Playwright](https://github.com/microsoft/playwright) | 浏览器测试、逐帧录制 | Apache-2.0 |
| [esbuild](https://github.com/evanw/esbuild) · [Tailwind CSS CLI](https://github.com/tailwindlabs/tailwindcss) | 构建 Loading UI 运行时 | MIT |
| [Vite](https://github.com/vitejs/vite) · [TypeScript](https://github.com/microsoft/TypeScript) · [oxlint](https://github.com/oxc-project/oxc) | 已下架日期选择器的构建与检查 | MIT / Apache-2.0 / MIT |
| [ffmpeg](https://ffmpeg.org/) | 把录制帧合成为视频（本地安装，不在仓库内） | LGPL / GPL |

## 5. 参考想法的作品

想法本身不受版权保护；我们只借鉴交互思路时，代码、图形和素材全部自己完成，这部分代码属于 UI Moments，按 MIT 发布。

这类来源**不在这里逐条维护**。规则很简单：

- 明显受某一个具体作品启发时，在 [`gallery/works.js`](gallery/works.js) 对应条目写一行 `credit`（作者与链接）。画廊卡片会显示「参考后实现」，详情里自动出现来源链接。
- 开关、步进器、长按确认这类通用交互模式，不需要标注。
- 不照搬对方的具体视觉造型、配色组合、文案或素材；如果做出来几乎一样，就改造型，或先征得原作者同意。

当前标注了参考来源的作品可以在图鉴里直接筛到：卡片副标题为「参考后实现」。

## 6. 我们自己的其它仓库

- [guanmo-ai/design-style](https://github.com/guanmo-ai/design-style)：风格库里「孟菲斯」(004) 与「包豪斯」(001) 的配色来源，同为观默维护。

## 7. 完全原创、未参考特定作品

| 作品 | 位置 |
| --- | --- |
| 37 个原创控件：Core、Visual、Motion、Gestures、Actions、Forms、Color 七组 | [gallery/originals/](gallery/originals/) |
| 折页、回信与 16 款原创加载动效 | [gallery/loaders/originals.mjs](gallery/loaders/originals.mjs)、[gallery/loaders/motifs.mjs](gallery/loaders/motifs.mjs) |
| 风格库的「像素风」变体 | [gallery/elastic-controls/variants.css](gallery/elastic-controls/variants.css) |
| 站点外壳、画廊、导出与提示词生成 | `assets/`、`index.html`、`styles.html` |

## 8. 明确不使用的内容

以下内容不会进入本仓库、网站或导出文件：Apple SF 字体、SF Symbols 与 HIG 原文；Shopify Polaris 代码；Salesforce 图标与图片（CC BY-ND）；任何公司的商标和 Logo（导航中的 GitHub 图标只用于链接到本仓库，遵循 GitHub 的标识使用规范）。我们也不暗示任何上游作者认可本项目。

---

如果你是上述任何作品的作者，认为署名不准确，或希望我们移除某个作品，请[提交 issue](https://github.com/guanmo-ai/ui-moments/issues/new/choose) 或在 X 上联系 [@guanmo_ai](https://x.com/guanmo_ai)，我们会尽快处理。
