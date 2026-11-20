# video-ai-upscale

Cursor Agent Skill：用本机 **Real-ESRGAN（ncnn-vulkan）+ FFmpeg** 给模糊 MP4 做超分。  
这是一份把「和 Agent 一起处理视频」沉淀成可复用技能的实践记录，不是 Real-ESRGAN 官方项目。

| 项 | 内容 |
|---|---|
| 触发说法 | 超分、清晰化、提高分辨率、模糊视频、Real-ESRGAN |
| 默认策略 | `realesr-animevideov3`、2 倍、30fps |
| 实测机 | Apple M1 Pro 16GB，macOS |
| 依赖 | ffmpeg、`realesrgan-ncnn-vulkan`（不需要 Python / CUDA） |

Agent 指令见 [SKILL.md](SKILL.md)，安装与排障见 [reference.md](reference.md)。

---

## 为什么要做成 Skill

直接让 Agent「把视频变清晰」会反复踩坑：选错模型、对已经插值过的文件再超一次、GitHub 下载极慢、工作目录不对导致进程崩溃、中断后进度被删。

做成 Skill 之后，Agent 会固定做这些事：

1. 先 `ffprobe`，优先用更高码率的原片
2. 按分辨率 × 帧数估算时间和磁盘，再开跑
3. 超过 2 分钟先剪试片
4. 调用 `scripts/upscale_video.sh`，不要手写拆帧循环
5. 中断后续跑，不重算已完成的帧

这就是 Cursor Skill 的价值：把一次调通的流程，变成以后每段视频都能复用的默认行为。

---

## 安装

### 1. 安装 Skill

```bash
git clone https://github.com/yuxingchen/video-ai-upscale.git ~/.cursor/skills/video-ai-upscale
```

或手动把本仓库放到 `~/.cursor/skills/video-ai-upscale/`，保证存在：

```
~/.cursor/skills/video-ai-upscale/
├── SKILL.md
├── reference.md
└── scripts/upscale_video.sh
```

新开一轮对话，或对 Agent 说「超分这段 MP4」即可触发。也可 `@video-ai-upscale` 点名。

### 2. 安装 ffmpeg

```bash
brew install ffmpeg
```

### 3. 安装 Real-ESRGAN 便携包（macOS）

国内直连 GitHub 往往只有几十 KB/s，用镜像：

```bash
mkdir -p "$HOME/Movies/realesrgan"
cd "$HOME/Movies/realesrgan"
curl -L --fail -o realesrgan-macos.zip \
  "https://ghfast.top/https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-macos.zip"
unzip -o realesrgan-macos.zip
xattr -dr com.apple.quarantine .
chmod +x realesrgan-ncnn-vulkan
./realesrgan-ncnn-vulkan -h
```

成功时应打印 Usage。推理时日志里会出现类似 `[0 Apple M1 Pro]` 的 GPU 名。

自定义路径：

```bash
export REALESRGAN_HOME=/path/to/realesrgan
```

Windows / Linux 用官方对应 zip，脚本同样走 `$REALESRGAN_HOME`。

---

## 使用方法

### 和 Agent 对话（推荐）

把 MP4 路径丢给 Cursor Agent，例如：

- 「把 `~/Movies/foo.mp4` 超分一下」
- 「先预估时间和磁盘，再处理」
- 「先剪 10 秒试片」
- 「从上次进度继续」

Agent 应调用：

```bash
caffeinate -dims ~/.cursor/skills/video-ai-upscale/scripts/upscale_video.sh \
  "$INPUT" "$OUTPUT" --model anime --scale 2 --fps 30
```

### 自己跑脚本

```bash
# 默认：2x / 30fps / 视频模型，输出为 原名_ai.mp4
~/.cursor/skills/video-ai-upscale/scripts/upscale_video.sh ~/Movies/foo.mp4

# 指定输出
~/.cursor/skills/video-ai-upscale/scripts/upscale_video.sh ~/Movies/foo.mp4 ~/Movies/foo_ai.mp4

# 续跑（进度目录已有帧时也会自动续）
~/.cursor/skills/video-ai-upscale/scripts/upscale_video.sh ~/Movies/foo.mp4 --resume

# 清空重来
~/.cursor/skills/video-ai-upscale/scripts/upscale_video.sh ~/Movies/foo.mp4 --fresh

# 成功后删除进度帧，腾磁盘
~/.cursor/skills/video-ai-upscale/scripts/upscale_video.sh ~/Movies/foo.mp4 --clean

# 保持原帧率（更慢）
~/.cursor/skills/video-ai-upscale/scripts/upscale_video.sh ~/Movies/foo.mp4 --fps source

# 真人试片（极慢，先剪 5～10 秒）
ffmpeg -y -ss 8 -t 5 -i ~/Movies/foo.mp4 -c copy /tmp/clip.mp4
~/.cursor/skills/video-ai-upscale/scripts/upscale_video.sh /tmp/clip.mp4 --model photo --scale 4 --tile 256
```

进度目录默认：`$HOME/Movies/realesrgan/jobs/<片名>/`。中断**不会**删除已完成的帧。

### 只要放大锐化、不要 AI

几十秒级，细节补不出：

```bash
ffmpeg -y -i 输入.mp4 \
  -vf "hqdn3d=2:1.5:6:6,scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart \
  输出_enhanced.mp4
```

---

## 试用效果（M1 Pro 16GB 实测）

片源都是手机录屏。超分救的是「分辨率偏低 + 压缩糊」，救不了严重失焦。录屏会连状态栏、按钮一起放大。

### 片 1：32 秒短片

| | 压缩版（不建议当输入） | 高码率原片 | FFmpeg 快速版 | AI 超分 |
|---|---|---|---|---|
| 分辨率 | 720×1554 | 890×1920 | 1440×3108 | 1780×3840 |
| 码率 | 1.6 Mbps | 12 Mbps | — | 约 20 Mbps |
| 体积 | 6.5 MB | 46 MB | 53 MB | 78 MB |
| 耗时 | — | — | 约 40 秒 | 约 **18 分钟** |

同一段录屏同时有压缩版和 raw 时，**必须超 raw**。对已经 Lanczos 过的文件再超，等于在插值像素上猜细节。

观感：FFmpeg 版「轻微好转」；AI 版人脸、竹林、字幕更清楚。`animevideov3` 偏动漫，真人脸会略平滑，但比纯锐化可用。

### 片 2：3 分 55 秒竖屏

| | 原片 | 10 秒试片 | 全片 AI |
|---|---|---|---|
| 分辨率 | 890×1624 | 1780×3248 | 1780×3248 |
| 时长 | 234.6 秒 | 10 秒 | 3 分 54 秒 |
| 体积 | 252 MB | 17 MB | 397 MB |
| 耗时 | — | 约 5 分 27 秒 | 约 **2 小时**（含中断后续跑） |
| 峰值磁盘 | — | 约 1.5 GB | 约 16～20 GB 进度帧 |

全片 7039 帧、30fps。中途停过一次，当时完成 5345 帧；后来 `--resume` 只跑剩余 1694 帧，约 33 分钟合成完毕。

### 耗时怎么估

```
耗时(秒) ≈ 帧数 × 1.1 × (宽×高) / (890×1920)
帧数 ≈ 时长(秒) × 输出帧率
```

同机对比：`realesrgan-x4plus` 在 890×1920 上约 **49 秒/帧**。32 秒片子要一天，3 分 55 秒竖屏不要用 x4plus 跑全片。

---

## 踩过的坑（给 Agent / 后来者）

1. **模型路径是相对的。** 不在工具目录运行、也不传 `-m`，`realesrgan-ncnn-vulkan` 会直接段错误。脚本已固定 `-m "$TOOL_DIR/models"`。
2. **符号链接当输入会失败。** 续跑必须用硬链接（跨盘则拷贝）。
3. **旧脚本 `trap cleanup EXIT` 会删进度。** 用 SIGTERM 停等于白做。现在进度在 `jobs/`，中断保留；必须杀进程时用 `kill -9` 或直接停新脚本。
4. **GitHub Release 在国内极慢。** 安装包走 `ghfast.top`。
5. **不要对 AI 输出再超一次。** 假细节会叠加。
6. **原片静音（约 -91 dB）不是超分弄丢的。**

---

## 预期边界

- 能改善：低分辨率、压缩糊、轻微发软
- 基本救不了：严重失焦、强运动模糊
- `animevideov3` 快，适合视频；`x4plus` 真人更细，但本机全片不现实
- 本仓库不含模型权重和测试成片（第三方内容 / 体积过大）

上游：

- Real-ESRGAN：https://github.com/xinntao/Real-ESRGAN
- 论文：https://arxiv.org/abs/2107.10833

---

## 许可

本仓库的 Skill、脚本和文档为 MIT。Real-ESRGAN 模型与 ncnn 可执行文件遵循各自上游许可，请从官方 Release 获取。
