# 交接文档：仓库审计与后续任务（给 Codex）

> 日期：2026-11-18 · 分支：`claude/kind-thompson-mbw2sk`
> 目标：把 UI Moments 做成一流的开源项目，整体体验更顺滑，原创内容更多，来源与许可无可挑剔。

这份文档分三部分：**这次已经做了什么**、**审计发现的问题（按优先级）**、**建议的下一步任务**。每个任务都写了位置、做法和验收标准，可以直接领取。

---

## 0. 先跑起来

```bash
npm run setup
```

```bash
npm run build && npm run lint && npm test
```

```bash
git add -A && npm run package:site && npx playwright install --only-shell chromium && npm run test:browser
```

本次交接时以上全部通过：单元测试 8 + 3 + 4 项，浏览器测试 4 项，日期逻辑检查通过。

关键文件速查：

| 想改什么 | 去哪里 |
| --- | --- |
| 首页结构 | `index.html` |
| 全站颜色令牌、导航、页脚 | `assets/site.css`（`:root` 与 `:root[data-theme="light"]`） |
| 画廊卡片、工具栏、详情弹窗样式 | `assets/gallery.css`、`gallery/loaders/style.css`（弹窗基础样式在这里，历史原因） |
| 卡片懒加载、详情、导出、统计数字 | `assets/gallery.mjs` |
| 作品排序与分类 | `assets/catalog.mjs`（`featured` 数组决定首屏顺序） |
| 交互控件清单 | `gallery/works.js` |
| 原创控件 | `gallery/originals/index.html` |
| 嵌入协议 | `assets/embed.js`（`?embed=ui&theme=&sample=&style=`，同源 `postMessage`） |

---

## 1. 这次已经完成

### 原创内容
- 第三次更新：原创控件页全部英文、单色；`gallery/originals/` 共八页（Core / Visual / Motion / Gestures / Elastic / Actions / Forms / Color）；Elastic 页 8 个作品参考 @yui540 视觉语言，`credit` 已标注。鲜艳作品标记 `vivid: true`，在 `assets/catalog.mjs` 中归入 `color`（「多彩」）分类并排在最后。Motion 页 7 个作品参考 amicro（MIT），`credit` 字段已标注。约定：**图鉴首屏只放单色作品；原创页面不出现中文**（`tools/site.test.mjs` 会检查）。
- 第二次更新：再加 20 个原创控件与 8 款原创加载动效。`gallery/originals/` 现有四个页面：`index.html`（基础 6）、`visual.html`（无文字图形交互 8）、`inputs.html`（表单 6）、`actions.html`（操作反馈 6）；新增加载动效在 `gallery/loaders/motifs.mjs`。四个页面共用同一套外壳，生成脚本未入库，新增页面时复制 `visual.html` 的结构即可。
- 新增 `gallery/originals/`：**墨滴开关、刻度旋钮、长按确认、滚轮步进器、翻页标签、潮汐进度** 六个从零设计的控件。单文件、无依赖；有正确的 ARIA 角色与键盘操作；支持深浅主题、`prefers-reduced-motion`、画廊离屏暂停；用 `container-type: size` 让控件在不同卡片尺寸下缩放。
- 已登记到 `gallery/works.js`（`originalControls`，`original: true`，无 `credit`），卡片显示「原创 · 类型」，复制 HTML 时注释写「UI Moments 原创设计与实现」。
- 新测试：`tools/site.test.mjs`「原创控件不带外部来源…」，`tools/browser.test.mjs`「原创控件支持键盘操作…」。

### 来源与许可
- 新增 **[CREDITS.md](../CREDITS.md)**：作品来源总表（原创 64 / 开源集成 149 / 参考后实现 19 = 232），收录的第三方代码（固定版本与位置）、打包进网站的运行时依赖、开发工具、只借鉴想法的作品、明确不使用的内容、原作者联系方式。
- `THIRD_PARTY_NOTICES.md` 顶部指向 CREDITS.md。

### 网站
- 首页重做：徽标、渐变标题、主次操作按钮、统计面板（数字由 `gallery.mjs` 根据目录实时计算）、点阵与柔光背景、四栏页脚（`id="sources"`，带完整来源折叠区）。
- 图鉴、风格库共用一套颜色令牌（原来风格库是纯黑底，和首页不一致）；导航统一为「图鉴 / 原创 / 风格库 / 来源」，新增 GitHub 入口；`#sources` 会自动展开来源。
- 顺滑度：卡片入场与筛选显示时淡入上移；循环动效挂载时淡入；iframe 载入完成后才显示（不再闪白/闪灰）；详情弹窗与遮罩淡入；悬停阴影；深浅切换用 View Transitions 交叉淡化；全部受「减少动态效果」约束。
- 弹性控件嵌入时舞台底色与画廊卡片一致（原来是偏灰的 `#282829`）。
- 新的社交分享图 `assets/og.jpg`（展示原创控件），新增 canonical 与 `og:url`。

### 开源仓库规范
- README 重写（徽章、深浅双版预览图、亮点、收录表、原创控件表、项目结构）；新增 `README.en.md`。
- 新增 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`CHANGELOG.md`、`.editorconfig`、`.github/ISSUE_TEMPLATE/*`、`.github/PULL_REQUEST_TEMPLATE.md`、`.github/dependabot.yml`。
- `package.json` 补充 `license`、`homepage`、`repository`、`bugs`、`keywords`。

---

## 2. 审计发现

图例：🔴 高（影响合规或用户）· 🟠 中（影响质量或维护）· 🟢 低（打磨）

### 🔴 P0 · 合规与可用性

1. **光照场景加载 Google Fonts。** `gallery/light-scenes/index.html:8-10` 请求 `fonts.googleapis.com` / `fonts.gstatic.com`。这在中国大陆通常无法访问，会导致字体回退和长时间等待；同时会把访客 IP 发给第三方。
   - 做法：把 Martian Mono、Noto Sans SC、Noto Serif SC、Roboto Flex 子集化后自托管到 `assets/fonts/`，附上 OFL 原文；或换用系统字体栈。
   - 验收：`grep -rn "fonts.g" gallery/` 无结果；在 `tools/site.test.mjs` 第一个测试的循环里加入 `gallery/light-scenes/index.html`。

2. **昼夜开关的视觉与参考原帖较接近。** 借鉴想法本身没有问题，代码也是自己写的，**不需要删除**。唯一的风险是照搬了具体造型（玻璃方形拨钮 + 点阵图标 + 琥珀/淡紫轮廓光的组合）。如需降低风险，调整配色或拨钮造型即可。是否调整由维护者决定，**不要自动修改**。

3. **风格库链接到 `guanmo-ai/design-style`。** `assets/styles.mjs` 中的「Design Style ↗」与 `CREDITS.md` 都指向该仓库。请确认它是公开仓库；若为私有，访客会看到 404，应改为说明文字。

### 🟠 P1 · 质量与维护

4. **已下架的日期选择器仍在流水线里。** `package.json` 的 `setup`、`build`、`lint`、`test` 都还会安装和构建 `gallery/date-picker`（Vite 8、TypeScript 7 等），拖慢 CI，且 `lint` 实际只检查日期选择器，对网站代码没有任何检查。
   - 做法 A（推荐）：把日期选择器迁到 `archive/` 或单独分支，从脚本中移除；`lint` 改为对 `assets/`、`gallery/*/` 的原生 JS 运行 oxlint（`npx oxlint assets gallery --ignore-pattern '**/vendor/**'`）。
   - 做法 B：重新上架并补上画廊条目。
   - 验收：`npm run setup` 时间明显缩短；`npm run lint` 覆盖站点 JS。

5. **大量未使用的视频进入发布包。** `gallery/day-night-toggle/{card,preview}.mp4`、`gallery/loaders/{card,preview}.mp4`、`gallery/light-scenes/clips/*.mp4` 共约 15 MB。画廊现在直接嵌入实时组件，`works.js` 里的 `video` / `full` / `poster` 字段已无代码读取，但 `tools/package-site.mjs` 仍把它们全部发布到 Pages。
   - 做法：在 `package-site.mjs` 中排除 `*.mp4`（README 里的展示视频仍可通过 GitHub 访问），并删除 `works.js` 中无用字段；或把视频移到 GitHub Release。
   - 验收：`_site/` 体积下降约 15 MB，浏览器测试仍通过。

6. **光照场景没有进入画廊。** `gallery/light-scenes/` 是完整作品，但不在 `works.js`，网站上没有任何入口。解决第 1 条后，可登记为「参考后实现 · 主题切换」，或在页脚「浏览」栏单独链接。

7. **旧的 LDRS 独立页风格过时。** `gallery/loaders/index.html` 仍是旧导航（「全部作品 / 加载动效」）和旧版式，与新首页不一致。建议改为重定向到 `index.html?q=LDRS#works`（保留 `gallery/ldrs/` 的兼容跳转），或套用新的导航与页脚。

8. **依赖告警。** `gallery/loading-ui` 与 `gallery/date-picker` 的 `npm audit` 报 `picomatch` ReDoS（GHSA-fc5q-39xc-vjpf）。目前所有版本都在受影响范围内、没有可用补丁；且只在构建期通过 `@tailwindcss/cli`、`vite` 间接使用，不进入网站。`npm audit fix` 只会裁掉锁文件里其它平台的可选依赖，**不要运行**。等上游发布修复后由 Dependabot 升级即可。

9. **CSS 可读性。** `assets/site.css` 与 `gallery/loaders/style.css` 前半部分是压成一行的规则，难以审阅和合并。建议用 Prettier（或手动）展开为每条声明一行，**不改任何值**，单独一个 PR。

10. **弹窗基础样式放错地方。** `dialog`、`.dialog-head`、`.editor` 等通用样式定义在 `gallery/loaders/style.css`，而首页通过 `<link>` 引入整份 loaders 样式。建议拆出 `assets/dialog.css`。

### 🟢 P2 · 打磨

11. **首屏的「开源来源 4」是写死的。** `index.html` 的 `.hero-stats` 第三格；可以在 `catalog.mjs` 中按 `loader.provider` / `credit.licensePath` 统计后用 `data-stat="sources"` 填充。
12. **国际化。** 站点只有中文。`README.en.md` 已提供英文说明；可考虑为 `works.js` / 各 `catalog.mjs` 中已有的 `en` 字段加一个界面语言切换。
13. **原创控件尚未进入风格库。**（现在有 26 个，适合挑 3–4 个图形交互先做） `styles.html` 只支持弹性控件与折页。可以为原创控件写孟菲斯 / 包豪斯 / 像素风变体（参考 `gallery/elastic-controls/variants.css` 的 `[data-ui-style]` 写法）。
14. **复制原创控件 HTML 会复制整页。** 详情里的「复制 HTML」复制的是控件所在的整个页面（6–8 个控件），并依赖 hash 只显示一个。更好的做法：复制时只保留对应的 `<section>`、它的 CSS 块和 JS 块（各块已用注释分隔），或者把每个控件拆成独立文件。另外 Geist 用相对路径引用，独立保存后回退到系统字体（不影响功能）。
15. **SEO 基础设施。** 缺少 `sitemap.xml`、`robots.txt`、`manifest.webmanifest`；`gallery/originals/index.html` 等子页面没有 OG 图。
16. **GitHub 仓库设置（需要维护者在网页上操作）：** 填写 About 描述与网站链接、添加 Topics（`ui`, `animation`, `micro-interactions`, `loaders`, `design`）、上传 Social preview（可用 `assets/og.jpg`）、开启 Private vulnerability reporting（`SECURITY.md` 依赖它）、视需要开启 Discussions。

---

## 3. 建议的执行顺序

| 顺序 | 任务 | 对应审计项 | 预计规模 |
| --- | --- | --- | --- |
| 1 | 光照场景字体自托管 + 测试 | #1 | 中 |
| 2 | 日期选择器移出流水线，lint 覆盖站点 JS | #4 | 中 |
| 3 | 发布包排除未使用视频 | #5 | 小 |
| 4 | 光照场景进入画廊、旧 LDRS 页重定向 | #6 #7 | 小 |
| 5 | 拆分 dialog.css、展开压缩 CSS | #9 #10 | 中（纯重构） |
| 6 | 统计数字动态化、子页面 OG、sitemap | #11 #15 | 小 |
| 7 | 原创控件的风格库变体 | #13 | 大（设计） |

需要人工判断、**不要自动处理**的：#2（作品相似度）、#3（私有仓库链接）、#16（仓库设置）。

---

## 4. 约定（请保持）

- **来源规则优先于一切。** 新增任何作品前先读 `docs/attribution.md`，并同步更新 `CREDITS.md`；`vendor/` 下的上游文件必须字节一致（`.gitattributes` 已关闭换行转换，测试会校验哈希）。
- **组件三件套。** 键盘可达、深浅主题、`prefers-reduced-motion`；嵌入时遵守 `data-gallery-active="false"`。
- **不引入外部运行时资源。** 网站与导出代码不请求 CDN、字体服务或统计脚本。
- **测试先行。** 改目录 / 数量时同步更新 `tools/site.test.mjs` 与 `tools/browser.test.mjs` 中的断言（例如卡片总数 232）。
- **提交信息** 使用简洁的中文祈使句，与现有历史一致。
