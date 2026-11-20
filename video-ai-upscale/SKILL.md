---
name: video-ai-upscale
description: >-
  Upscale and sharpen blurry MP4 videos with FFmpeg and Real-ESRGAN
  (realesrgan-ncnn-vulkan). Use when the user asks to 超分, 清晰化, 提高分辨率,
  模糊视频变清晰, enhance/upscale a video, Real-ESRGAN, Video2X, or process
  a local .mp4/.mov that looks compressed or low-res.
---

# AI 视频超分

本机工具链：`$HOME/Movies/realesrgan/`（ncnn-vulkan + MoltenVK，不需要 Python/CUDA）。  
详细原理、安装、故障排除见 [reference.md](reference.md)。

## 默认策略

1. **先 ffprobe 片源**。同目录若有更高码率的 `_raw` / 未压缩版，用那条，不要超已经插值过的文件。
2. **先快速版还是直接 AI**：用户没指定时，短片可直接 AI；也可先 FFmpeg 对照。不要对 AI 输出再超一次。
3. **全片默认**：`--model anime --scale 2 --fps 30`（`realesr-animevideov3`）。
4. **禁止默认上 x4plus 全片**。本机 M1 Pro 上约 49 秒/帧；32 秒竖屏要十几个小时。真人想冲画质：先剪 5～10 秒试片。
5. **先设预期**：能改善压缩糊和低分辨率；救不了失焦/运动模糊；录屏会连 UI 一起放大；原片静音则输出也无声。

## Agent 工作流

```
进度:
- [ ] ffprobe 分辨率/时长/码率/音轨
- [ ] 确认工具存在，缺则按 reference.md 安装
- [ ] 告知预估耗时，再开跑
- [ ] caffeinate + 脚本（长超时）
- [ ] 汇报输出路径与规格
```

### 1. 探片

```bash
ffprobe -hide_banner "$INPUT"
```

关注 `width/height`、时长、视频码率。音量可测：

```bash
ffmpeg -i "$INPUT" -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"
```

`-91 dB` ≈ 静音。

### 2. 检查工具

```bash
test -x "$HOME/Movies/realesrgan/realesrgan-ncnn-vulkan" && ffmpeg -version | head -1
```

缺失时按 [reference.md](reference.md) 的安装节处理（国内用 `ghfast.top` 镜像）。

### 3. 预估耗时（M1 Pro 16GB，animevideov3 2x，`-j 2:2:2`）

```
耗时(秒) ≈ 帧数 × 1.1 × (宽×高) / (890×1920)
帧数 ≈ 时长(秒) × 输出帧率
```

实测：890×1920、32 秒、30fps（约 970 帧）→ **约 18 分钟**。x4plus 同分辨率约 **49 秒/帧**。  
磁盘峰值大约是输出分辨率 JPG 序列。进度在 `$HOME/Movies/realesrgan/jobs/<片名>/`，中断不会删除。超过 2 分钟的片子先剪试片。

### 4. 执行（执行脚本，不要手写拆帧循环）

```bash
caffeinate -dims ~/.cursor/skills/video-ai-upscale/scripts/upscale_video.sh \
  "$INPUT" "$OUTPUT" --model anime --scale 2 --fps 30
```

- 省略 `$OUTPUT` 时写到原片旁，文件名加 `_ai.mp4`
- 进度目录已有帧时**自动续跑**；显式续跑加 `--resume`；重来加 `--fresh`
- 合成成功后默认保留进度；要腾空间加 `--clean`
- 保持原帧率：`--fps source`
- 显存不够：`--tile 256`
- 真人试片：`--model photo --scale 4 --tile 256`
- 超分可跑很久：Shell `block_until_ms` 按预估再加缓冲，或后台跑完再合成确认

### 5. FFmpeg 快速对照（几十秒级，无 AI）

```bash
ffmpeg -y -i "$INPUT" \
  -vf "hqdn3d=2:1.5:6:6,scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart \
  "${INPUT%.*}_enhanced.mp4"
```

## 单帧试效果

```bash
TOOL="$HOME/Movies/realesrgan"
ffmpeg -y -ss 8 -i "$INPUT" -frames:v 1 -update 1 -q:v 2 /tmp/one.jpg
"$TOOL/realesrgan-ncnn-vulkan" -i /tmp/one.jpg -o /tmp/one_x2.png -n realesr-animevideov3 -s 2 -v
```

## 汇报格式

处理完成后告诉用户：输出路径、分辨率、帧率、体积、用了哪个模型、大约耗时。提醒：animevideov3 偏动漫，真人脸可能略平滑。
