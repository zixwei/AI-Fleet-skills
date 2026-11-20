# AI 视频超分参考

配合 [SKILL.md](SKILL.md)。工具目录默认 `$HOME/Movies/realesrgan/`。

## 原理

普通放大（Lanczos 等）是插值，画面变大但不增加真实细节。锐化只加强反差，也会放大噪点。

Real-ESRGAN 按训练数据生成看起来合理的高频细节，不是找回原像素。ncnn 版把帧切成 tile 推理再拼接，拼缝偶发不一致。可执行文件只吃图片/目录，视频必须：拆帧 → 超分 → 合成。macOS 上 Vulkan 走 MoltenVK，打在 Apple GPU 上。不需要 Python / PyTorch / CUDA。

论文：https://arxiv.org/abs/2107.10833  
项目：https://github.com/xinntao/Real-ESRGAN

能改善：低分辨率、压缩糊。  
救不了：严重失焦、强运动模糊。录屏会连 UI 一起放大。不要对已经插值或已经超过分的文件再超一次。

## 硬件

| 项目 | 最低 | 推荐 | 实测机 |
|---|---|---|---|
| 芯片 | Apple Silicon 或带 GPU 的 Intel Mac | M1 Pro / M2+ | M1 Pro |
| 内存 | 8 GB（必须开 tile） | 16 GB | 16 GB |
| 磁盘 | 原片 50～150 倍空闲 | 20 GB+ | — |
| GPU | MoltenVK | Apple GPU | M1 Pro |

## 耗时（M1 Pro 16GB，890×1920 测试片）

| 模型 | 单帧 | 30fps 约 970 帧 | 60fps 约 1930 帧 |
|---|---|---|---|
| animevideov3 2x | 流水线约 1.1 秒/帧 | 约 18 分钟 | 约 35～40 分钟 |
| x4plus 4x tile=256 | 约 49 秒/帧 | 约 13 小时 | 约 26 小时 |

```
耗时(秒) ≈ 帧数 × 1.1 × (宽×高) / (890×1920)
帧数 ≈ 时长(秒) × 输出帧率
```

合成（libx264 CRF 18）额外约 1～2 分钟。进度默认保存在 `$HOME/Movies/realesrgan/jobs/<片名>/`，中断后续跑同一命令或加 `--resume`。加 `--clean` 才在成功后删进度。

## 安装

```bash
brew install ffmpeg

mkdir -p "$HOME/Movies/realesrgan"
cd "$HOME/Movies/realesrgan"
curl -L --fail -o realesrgan-macos.zip \
  "https://ghfast.top/https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-macos.zip"
unzip -o realesrgan-macos.zip
xattr -dr com.apple.quarantine .
chmod +x realesrgan-ncnn-vulkan
./realesrgan-ncnn-vulkan -h
```

成功时应出现 Usage，运行时日志含 `[0 Apple M1 Pro]` 一类 GPU 名。  
官方直链（国外）：https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-macos.zip

目录需含 `realesrgan-ncnn-vulkan` 与 `models/`（animevideov3 x2/x3/x4、x4plus、x4plus-anime）。

Gatekeeper：`xattr -dr com.apple.quarantine "$HOME/Movies/realesrgan"`，仍拦则在「隐私与安全性」点仍要打开。不要关 Gatekeeper。

自定义路径：`export REALESRGAN_HOME=/path/to/realesrgan`

## 模型

| `-n` | 脚本 | 倍数 | 何时用 |
|---|---|---|---|
| `realesr-animevideov3` | `--model anime` | 2/3/4 | **默认。** 视频、录屏、动漫 |
| `realesrgan-x4plus` | `--model photo` | 实质 4x | 真人更好，极慢；只做试片 |
| `realesrgan-x4plus-anime` | 手写命令 | 4x | 动画线稿 |

主程序参数：`-i/-o` 文件或目录；`-s 2|3|4`；`-t` tile（0 自动，OOM 用 256）；`-f jpg`；`-j 2:2:2`；`-v`；`-x` TTA 一般不用。

## 手动三步（脚本不可用时）

```bash
cd "$HOME/Movies/realesrgan"
IN="输入.mp4"; OUT="输出_ai.mp4"
mkdir -p work/in work/out
ffmpeg -y -i "$IN" -vf fps=30 -qscale:v 1 -qmin 1 -qmax 1 work/in/frame%08d.jpg
./realesrgan-ncnn-vulkan -i work/in -o work/out -n realesr-animevideov3 -s 2 -f jpg -j 2:2:2
ffmpeg -y -framerate 30 -i work/out/frame%08d.jpg -i "$IN" \
  -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -shortest -movflags +faststart "$OUT"
```

无音轨则去掉 `-map 1:a:0`。保持原帧率拆帧用 `-vsync 0`，合成 `-framerate` 对上原片。

## 故障排除

| 现象 | 处理 |
|---|---|
| 身份不明的开发者 | `xattr -dr com.apple.quarantine`，系统设置里仍要打开 |
| 没有 GPU 行 | 加 `-v`；不要在无 GPU 虚拟机里跑 |
| kill / 闪退 | `--tile 256` |
| 进度 0%～100% 反复 | 正常，每帧一轮 |
| 输出帧数不够 | 磁盘满或休眠；`df -h` 后重跑 |
| 接缝 | 把 `-t` 改大或 `0` |
| GitHub 下载极慢 | `ghfast.top` 镜像 |
| `matches no streams` 音频 | 原片无音轨 |
| 花屏 / 打不开 | `-pix_fmt yuv420p`，宽高为偶数 |
| 风扇狂转 | 正常，插电 |

## 实测样例

完整试用数据、踩坑和 Agent 工作流见 [README.md](README.md)。
