# 原创控件 · UI Moments Originals

控件分在八个英文页面里（页面内不出现中文，配色为单色；只有 color.html 使用彩色）。打开页面可以同时操作该页全部控件；`<页面>.html#<id>` 只显示其中一个；主画廊通过 `?embed=ui&sample=<id>` 分别嵌入。

| 页面 | 内容 |
| --- | --- |
| [visual.html](visual.html) | 无文字的图形交互：磁吸点阵 `magnet-grid`、果冻方块 `jelly-pad`、融合水滴 `merge-drops`、涟漪画板 `ripple-pad`、花朵开关 `bloom-toggle` |
| [motion.html](motion.html) | 微交互：`card-fan`、`depth-stack`、`cover-flow`、`tilt-card`、`magnetic-button`、`text-reveal`、`menu-morph`、`stagger-rows`（除 `menu-morph` 外的 7 个参考 amicro，MIT，见 works.js 的 `credit`） |
| [gestures.html](gestures.html) | 手势与物理：`swipe-confirm`、`pull-refresh`、`elastic-string`、`domino-row`、`rocker-switch`、`scrub-wave`、`snap-grid`、`radial-menu`、`step-track`、`breath-orb` |
| [elastic.html](elastic.html) | 弹性控件（参考 @yui540 视觉语言，works.js 已标注 `credit`）：`stretch-toggle`、`worm-dots`、`rubber-search`、`gooey-tabbar`、`squash-play`、`cart-badge`、`elastic-accordion`、`bulge-volume` |
| [color.html](color.html) | 多彩：色轮 `hue-orbit`、拉绳灯 `pull-cord`、抛硬币 `flip-coin` |
| [index.html](index.html) | 基础控件（见下表） |
| [actions.html](actions.html) | 操作反馈：复制按钮 `copy-morph`、点赞爆发 `like-burst`、纸飞机发送 `paper-plane`、下载进度环 `download-ring`、验证码 `code-shake`、通知铃 `bell-toggle` |
| [inputs.html](inputs.html) | 表单控件：划线清单 `stroke-checklist`、石子评分 `pebble-rating`、档位滑块 `notch-slider`、密码强度 `strength-meter`、标签输入 `chip-input`、方案卡片 `plan-picker` |

## 基础控件（index.html）

| 控件 | ID | 交互 | 无障碍 |
| --- | --- | --- | --- |
| 墨滴开关 | `ink-switch` | 拨钮里的墨滴落进轨道并晕开，关闭时沿原路收回 | `role="switch"`，空格 / 回车 |
| 刻度旋钮 | `detent-dial` | 围绕旋钮拖动，指针被最近的刻度吸住，松手弹回 | `role="slider"`，方向键、PageUp/PageDown、Home/End |
| 长按确认 | `hold-confirm` | 按住填满才执行，中途松手快速退回，轻点给出提示 | 按住空格 / 回车；状态写入 `aria-live` |
| 滚轮步进器 | `odometer-stepper` | 每一位数字朝变化方向滚动，长按加速，到边界轻顶 | `role="spinbutton"`，方向键、PageUp/PageDown、Home/End |
| 翻页标签 | `leaf-tabs` | 选中底卡像一页纸翻到新标签，柱形依次生长 | `tablist` / `tab` / `tabpanel`，方向键与 Home/End |
| 潮汐进度 | `tide-progress` | 液面按弹簧追上目标，变化越快晃得越厉害，数字随液面反色 | 按钮 `aria-label` 报告当前进度 |

## 来源

全部控件的代码与造型由 UI Moments 完成。Motion 页中标注了 `credit` 的作品参考了 amicro 的卡片排布与过渡类型，其余没有参考特定作品；也没有使用第三方代码、字体以外的素材或依赖。字体 Geist 按 SIL OFL 1.1 自托管，见 [assets/fonts](../../assets/fonts/)。源码按项目 [MIT 许可证](../../LICENSE) 提供。

## 设计约定

- 单色令牌：深色舞台 `#161618`、前景 `#fafafa`；浅色舞台 `#f2f2f3`、前景 `#18181b`。需要颜色的作品放进 `color.html`，并在 works.js 标记 `vivid: true`。
- 舞台使用 `container-type: size`，控件按卡片尺寸整体缩放；指针坐标始终用实际几何计算，缩放后仍然准确。
- 嵌入画廊时由 [embed.js](../../assets/embed.js) 同步主题与离屏状态。`data-gallery-active="false"` 时停止过渡和 canvas 绘制。
- 开启「减少动态效果」时保留全部功能，只去掉形变、晃动与滚动动画。

## 新增一个原创控件

1. 选一个合适的页面（或复制 `visual.html` 新建一页），在 `.samples` 中加一个 `<section class="sample" id="<id>">`，控件放在 `.stage > .widget` 里。
2. 脚本写在独立的 `{ ... }` 块中，动画前先检查 `motionEnabled()`。
3. 在 [gallery/works.js](../works.js) 对应的数组（`originalCore` / `originalVisuals` / `originalMotion` / `originalGestures` / `originalInputs` / `originalActions`）中登记，并运行 `npm test`。
