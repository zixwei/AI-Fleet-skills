# 火柴人视频 stickman-video-director（菲菲适配，2026-11-17 实测）

源：@CrazyKaomei 帖（2026-11-16）+ 仓库 github.com/kaomei/stickman-video-director（6,635 star，MIT）。
上游完整 Skill 在同目录 UPSTREAM-SKILL.md，核心 references 已存同目录 references/（含 A7 四段提示词规范、橡皮管生产/验收、B1 极简线条、风格目录、分镜模板）。
全仓 658MB 主要是预览素材，未整仓克隆（稀疏克隆实测卡住）；缺的 reference 按需从上游 raw 补拉。

## 两条引擎（选管线时先分清）
| 引擎 | 本质 | 成本 | 丝滑度 | 本机走法 |
|---|---|---|---|---|
| A 模型引擎（A1-A7） | 分镜提示词喂视频模型直出连续镜头 | 烧视频模型额度，越长越贵、要抽卡 | 高，真连续运动 | Muse 视频工具生成；作者原路线是 Google Flow（Omni Flash，720p/10s/场），本机无 Flow 账号 |
| B 代码引擎（B1-B6） | 分层素材+代码逐帧动画，本地渲染 | 零视频额度，只吃 Agent 额度 | 取决于逐帧密度，本质与 Remotion 同族 | 本地 Python PIL 逐帧 + ffmpeg（样片路线）；或 Remotion |

风格：A1 经典黑白 / A2 现代流行 / A3 史前洞穴 / A4 温馨叙事 / A5 历史卡通 / A6 琥珀 noir / A7 橡皮管；B1 极简线条 / B2 彩色手绘 / B3 复古电视 / B4 生存惊悚 / B5 角色讲解 / B6 动感 Meme。

## A7 橡皮管铁律（上游验收规范，摘）
- 四段式提示词：Block1 固定角色 + Block2 固定画风/色板，必须逐字复用（见 references/a7-prompt-contract.md），只换 Block3 场景 + Block4 分时动作/镜头。
- 角色：细线火柴人、白圆脸、两撮头发、细线躯干四肢，**不许穿衣服、不许填充躯干**。
- 色板：低饱和彩色——鼠尾草灰绿、珍珠灰、灰褐、象牙白 + 少量褪色砖红点缀。**不是黑白、不是棕褐 sepia**，不要重划痕/暗角。
- 参考图走「素材/参考」位定身份与画法，不是首帧；厨房参考图存 references/a7-kitchen-ref.jpg。
- 验收看真片：角色漂移、节拍顺序、接触关系不过关就是不过关，提示词对了不算数。

## 本机实测（2026-11-17，同题：闹钟吓醒→踩袜滑倒→喝咖啡复活）
- B 样片：~/workspace/stickman-lab/b-sample/stickman-b1-sample.mp4，1280x720/30fps/16.5s/559KB，PIL 逐帧流式喂 ffmpeg，渲染 26.3 秒，零成本。单场景横移贯穿三幕，字幕烧录，无右下角文字。
- A 样片 v2（交付版）：~/workspace/stickman-lab/a-sample/stickman-a7-sample-v2.mp4，1280x704/24fps/10s/6.7MB，Muse 视频工具 + 厨房参考图 + 四段规范生成。色板和细线身体基本对版；残留问题：6 秒处躯干线变粗/脸空白、结尾特写脸漂移且咖啡节拍跑到出门后，严格 A7 验收不算全过。
- A 样片 v1（已淘汰）：纯文字提示词、棕褐黑白 + 穿睡衣填充躯干，角色三幕三变。教训：A 模式不带参考图、不按四段规范，出片必漂。
- 结论：要丝滑/丰富选 A（付额度、要验收返修）；要便宜/可控/角色稳选 B（逐帧密度决定丝滑上限）。
- **主人定版（2026-11-17 看完双样片）：后面发的 A7 画面更精致。以后火柴人成品优先 A 模型引擎，B 只作免费打样/兜底，不再默认 B 出成品。**
- 长片实测（2026-11-17，《凌晨2点精神，下午2点断电》腺苷科普，67.5s）：分场生成 6 条×10s（每场一梗）→ Aria 中文配音分段对齐 → ffmpeg 拼接+烧字幕+响度 -14.9 LUFS → 抽帧 8 张全过。分场后节拍不再乱序；脸随场景有夸张变形（搞笑题材可接受）。成品 ~/workspace/stickman-lab/adenosine/adenosine-final.mp4（16:9）+ adenosine-vertical.mp4（9:16 模糊垫底版）。单条整片生成只适合 ≤10s，长片必须分场。
- **节奏定版（2026-11-18 主人打回 v1「节奏太慢、停顿怪怪的」后定）**：①取消静默片头卡，标题改烧进第一场画面上方，配音 0 秒起；②文案写满，每场约 55–60 字，配音 speed 112；③每场画面用 setpts 变速压到该场配音时长+0.15s，配音首尾相接零静默；④配音段时长离群必查（实测一稿 8 秒文案被 TTS 念成 23 秒、句间塞 1.1–1.45 秒停顿，silencedetect 可查；同文案重念会命中缓存坏稿，须改几个字破缓存再生成）。v2《你以为你在刷手机？其实手机在刷你》多巴胺篇 53.5s，成品 ~/workspace/stickman-lab/dopamine/dopamine-final.mp4。

## B-Remotion 现成骨架 stickman-story（2026-11-20 主人令克隆实测，源 @soundofdragon 回复帖指路）
- 仓库 ahmadaryanto/stickman-story（64 星，MIT，commit 4f2262c），原仓+实测在 ~/workspace/stickman-story-lab/repo（596KB，审计干净：源码无 exec/eval/fetch，依赖只有 Remotion 4.0.535 + React 19 + TS）。
- 定位：B 代码引擎的现成 Remotion 骨架，补 PIL 路线没有的组件库。竖版 1080×1920/30fps；`src/rig/` 火柴人骨架+姿势（idle/walk/sit/typing/point/cheer/mix）+3 套换装，`Camera2D` 平移/缩放/跟随，`CaptionTrack` 字幕轨，`Furniture` 桌椅/显示器/白板，3 个示例（走路 5s / 办公室 12s / 微纪录片 11s）。
- 实测（2026-11-20）：`npm ci` 258 包 34 秒；typecheck 0 错；still 5 张亲查——人物/换装/坐姿打字/字幕/流程图场景全对版，无水印、无右下角文字；Example03 全片渲染 2 分 02 秒出 1080×1920/30fps/11.0s/735KB，成品 ~/workspace/stickman-story-lab/repo/out/example03-mini-documentary.mp4。
- **本机适配补丁（已打在 lab 仓 palette.ts，勿回退）**：上游用 @remotion/google-fonts 在无头 Chromium 里拉 fonts.gstatic.com，本机走出口代理报 ERR_SSL_PROTOCOL_ERROR（curl 正常、浏览器不行）；FONT 已改本地字体栈 `'Noto Sans CJK SC', 'DejaVu Sans', sans-serif`。渲染须带 `--browser-executable=$HOME/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`。
- 工作法（上游精华，值得复用）：REUSE → RESKIN → NEW，先复用现成场景、只改颜色/文字/位置/帧数，新代码是最后手段；CLAUDE.md 只做短索引按需读文件——这是省 agent token 的关键，正对 @soundofdragon 原帖「一条片烧掉半周 Muse 额度」的坑。
- 短板写死：作者自称简化教育版、非完整生产引擎；画风是暗底+填充躯干的圆头小人（不是细线火柴人），人物在竖版画面里偏小、留白多，要近景须自己调 Camera2D zoom；只有室内家具，没有户外/恐怖场景。
- **分工定版**：科普讲解/流程解说/办公室类短片要便宜可控，用这个骨架（B）；恐怖故事、丧尸这类氛围叙事（如 @soundofdragon 的电梯 7 楼 180 秒横版片，抽帧实查是精细插画背景+大头角色+电影感打光）是 A 模型引擎的活，这个骨架做不出，别拿它硬套。成品优先 A 的旧定版不变。

## 现代火柴人故事片（A 引擎·叙事风，2026-11-20 首测《电梯总停在没人的楼层》）
- 题材源 @soundofdragon《电梯 7 楼》：主人点头练中文版。做法：不用 A7 橡皮管 blocks，另立现代故事风固定 blocks（女主：大圆白脸+黑马尾+青绿毛衣+米色托特包；保安大爷：圆白脸+圆眼镜+灰胡子+棕开衫；画风：手绘精细背景、深夜蓝+暖黄台灯、电影感悬疑转温暖），全片逐字复用 + 原作帧作参考图定身份/画风，6 场 ×10s 分场生成。
- 成品 ~/workspace/stickman-lab/elevator/elevator-final.mp4：1280×720/24fps/57.9s/22MB，响度实测 -14.5 LUFS，配音 Aria speed 112、六段 11.5/9.4/8.2/9.5/9.4/9.0s，生产包 kit.md + build.py 在同目录。
- 抽帧验收：S1–S5 画风与原作同档（办公室加班、电梯开空层、捂嘴+黑影逼近、大爷浇花、相框老太太全对版）；短板如实记：S6 画风变扁（平涂感明显强于前五场）、S4 大爷特写脸偏写实与 S5/S6 圆白脸不完全一致、场景内 ELEVATOR/FIRE EXIT 英文标识是模型自带（非字幕）。
- **TTS 新坑（2026-11-20 实证）**：整段 54 字配音两次都生成 22.7 秒坏稿——第一句后塞 8.5 秒静默，改几个字破缓存也没用；解法是按句拆成两段分别生成再本地 concat，得到干净 9.4 秒。以后配音时长离群先 silencedetect，拆段重录优先于改字重录。

## 《电梯》v2 修订（2026-11-20 主人令两项一起做）
- S6 重做：改用本片 S5/S2 的成品帧作参考图（不再用原作帧）+ 提示词明写「不要扁平极简卡通、要宽镜侧面构图」，新 S6 与前五场同档（锈墙细节、蹲放粉花、双人侧脸、结尾两盆花并排+暖光门缝全对版）。教训：同片返修定画风优先用本片已过关的帧当参考，比外部参考更贴。
- BGM：本机无音乐生成工具，改用 numpy 纯合成（make_bgm.py 在 elevator 目录）：前 39.2 秒 D 小调悬疑（低音 drone+稀疏钢琴单音+远处八音盒泛音），39.2 秒起转 F 大调八音盒旋律+软钢琴和弦，转折点对齐 S5 真相揭晓；BGM 本体 -21.4 LUFS、混音后成片 -14.3 LUFS，旁白清楚。成品 elevator-final-v2.mp4（57.95s/23MB），v1 保留在 elevator-final.mp4。
