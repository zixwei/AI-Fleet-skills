#!/usr/bin/env bash
# AI 视频超分：拆帧 -> Real-ESRGAN -> 合成 MP4
# 进度保存在 $REALESRGAN_HOME/jobs/<片名>/ ，中断后可 --resume
set -euo pipefail

TOOL_DIR="${REALESRGAN_HOME:-$HOME/Movies/realesrgan}"
BIN="$TOOL_DIR/realesrgan-ncnn-vulkan"
MODEL="realesr-animevideov3"
SCALE=2
FPS="30"
TILE=0
JOBS="2:2:2"
WORK_DIR=""
RESUME=0
FRESH=0
CLEAN=0

usage() {
  cat <<'EOF'
用法:
  upscale_video.sh <输入.mp4> [输出.mp4] [选项]

选项:
  --scale 2|3|4       放大倍数，默认 2
  --model anime|photo anime=视频模型(快)  photo=x4plus(慢、真人更好)
  --fps 30|source     输出帧率，默认 30；source 表示保持原片帧率
  --tile N            显存不够时改 256 或 400，默认 0=自动
  --work-dir DIR      进度目录，默认 $REALESRGAN_HOME/jobs/<片名>
  --resume            从进度目录接着跑（跳过已超分的帧）
  --fresh             清空进度目录后重来
  --clean             合成成功后删除进度目录
  -h, --help          显示帮助

中断不会删除已完成的帧。续跑：
  upscale_video.sh 输入.mp4 --resume
EOF
}

INPUT=""
OUTPUT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --scale) SCALE="${2:?}"; shift 2 ;;
    --model)
      case "${2:?}" in
        anime) MODEL="realesr-animevideov3" ;;
        photo) MODEL="realesrgan-x4plus" ;;
        *) echo "未知模型: $2（只用 anime 或 photo）" >&2; exit 1 ;;
      esac
      shift 2
      ;;
    --fps) FPS="${2:?}"; shift 2 ;;
    --tile) TILE="${2:?}"; shift 2 ;;
    --work-dir) WORK_DIR="${2:?}"; shift 2 ;;
    --resume) RESUME=1; shift ;;
    --fresh) FRESH=1; shift ;;
    --clean) CLEAN=1; shift ;;
    --) shift; break ;;
    -*) echo "未知参数: $1" >&2; usage; exit 1 ;;
    *)
      if [[ -z "$INPUT" ]]; then
        INPUT="$1"
      elif [[ -z "$OUTPUT" ]]; then
        OUTPUT="$1"
      else
        echo "多余参数: $1" >&2
        exit 1
      fi
      shift
      ;;
  esac
done

if [[ -z "$INPUT" ]]; then
  usage
  exit 1
fi
if [[ ! -f "$INPUT" ]]; then
  echo "找不到输入文件: $INPUT" >&2
  exit 1
fi
if [[ ! -x "$BIN" ]]; then
  echo "找不到可执行文件: $BIN" >&2
  echo "请安装 realesrgan-ncnn-vulkan 到 $TOOL_DIR，或设置 REALESRGAN_HOME" >&2
  exit 1
fi
if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  echo "需要先安装 ffmpeg：brew install ffmpeg" >&2
  exit 1
fi
if [[ "$RESUME" -eq 1 && "$FRESH" -eq 1 ]]; then
  echo "不能同时使用 --resume 和 --fresh" >&2
  exit 1
fi

INPUT="$(cd "$(dirname "$INPUT")" && pwd)/$(basename "$INPUT")"
STEM="$(basename "${INPUT%.*}")"
if [[ -z "$OUTPUT" ]]; then
  OUTPUT="${INPUT%.*}_ai.mp4"
fi
if [[ -z "$WORK_DIR" ]]; then
  WORK_DIR="$TOOL_DIR/jobs/$STEM"
fi

IN_DIR="$WORK_DIR/in"
OUT_DIR="$WORK_DIR/out"
TODO_DIR="$WORK_DIR/todo"
META="$WORK_DIR/job.json"

if [[ "$FRESH" -eq 1 && -d "$WORK_DIR" ]]; then
  echo "清空进度目录: $WORK_DIR"
  rm -rf "$WORK_DIR"
fi

# 进度目录已有输出帧时，未指定 --fresh 则自动续跑
if [[ "$RESUME" -eq 0 && "$FRESH" -eq 0 && -d "$OUT_DIR" ]]; then
  EXISTING_OUT="$(find "$OUT_DIR" -maxdepth 1 -name 'frame*.jpg' | wc -l | tr -d ' ')"
  if [[ "$EXISTING_OUT" -gt 0 ]]; then
    RESUME=1
    echo "发现已有进度 $EXISTING_OUT 帧，自动续跑。重来请加 --fresh"
  fi
fi

mkdir -p "$IN_DIR" "$OUT_DIR"
echo "进度目录: $WORK_DIR"
echo "（中断不会删除进度；续跑加 --resume 或直接再执行同一命令）"

drop_truncated_jpegs() {
  python3 - "$OUT_DIR" <<'PY'
import sys
from pathlib import Path
out = Path(sys.argv[1])
files = sorted(out.glob("frame*.jpg"))
removed = 0
for f in reversed(files[-8:] if files else []):
    data = f.read_bytes()
    if len(data) < 100 or data[:2] != b"\xff\xd8" or data[-2:] != b"\xff\xd9":
        print(f"删除不完整帧: {f.name}")
        f.unlink()
        removed += 1
    else:
        break
sys.exit(0)
PY
}

write_meta() {
  python3 - "$META" "$INPUT" "$OUTPUT" "$MODEL" "$SCALE" "$FPS" "$ENCODE_FPS" "$TILE" "$JOBS" <<'PY'
import json, sys
path, inp, outp, model, scale, fps, encode_fps, tile, jobs = sys.argv[1:]
data = {
    "input": inp,
    "output": outp,
    "model": model,
    "scale": int(scale),
    "fps": fps,
    "encode_fps": encode_fps,
    "tile": int(tile),
    "jobs": jobs,
}
with open(path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY
}

ENCODE_FPS="$FPS"
if [[ "$FPS" == "source" ]]; then
  ENCODE_FPS="$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of csv=p=0 "$INPUT")"
fi

if [[ "$RESUME" -eq 1 && -f "$META" ]]; then
  # 续跑时以 job.json 为准，避免参数不一致
  eval "$(python3 - "$META" <<'PY'
import json, sys
p = json.load(open(sys.argv[1]))
def sh(k, v):
    print(f'{k}={json.dumps(str(v))}')
sh("MODEL", p.get("model", ""))
sh("SCALE", p.get("scale", 2))
sh("FPS", p.get("fps", "30"))
sh("ENCODE_FPS", p.get("encode_fps", p.get("fps", "30")))
sh("TILE", p.get("tile", 0))
sh("JOBS", p.get("jobs", "2:2:2"))
if p.get("output"):
    sh("OUTPUT", p["output"])
PY
)"
fi

SRC_W="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$INPUT")"
SRC_H="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$INPUT")"
SRC_FPS="$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of csv=p=0 "$INPUT")"
DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$INPUT")"

echo "输入: $INPUT"
echo "输出: $OUTPUT"
echo "源分辨率: ${SRC_W}x${SRC_H}  时长: ${DURATION}s  源帧率: $SRC_FPS"
echo "模型: $MODEL  倍数: ${SCALE}x  输出帧率: $FPS"

IN_COUNT="$(find "$IN_DIR" -maxdepth 1 -name 'frame*.jpg' | wc -l | tr -d ' ')"
echo
echo "[1/3] 拆帧..."
if [[ "$IN_COUNT" -gt 0 && "$RESUME" -eq 1 ]]; then
  echo "复用已有原帧 $IN_COUNT 张"
else
  rm -f "$IN_DIR"/frame*.jpg
  if [[ "$FPS" == "source" ]]; then
    ffmpeg -hide_banner -loglevel error -y -i "$INPUT" \
      -qscale:v 1 -qmin 1 -qmax 1 -vsync 0 \
      "$IN_DIR/frame%08d.jpg"
  else
    ffmpeg -hide_banner -loglevel error -y -i "$INPUT" \
      -vf "fps=${FPS}" -qscale:v 1 -qmin 1 -qmax 1 \
      "$IN_DIR/frame%08d.jpg"
  fi
  IN_COUNT="$(find "$IN_DIR" -maxdepth 1 -name 'frame*.jpg' | wc -l | tr -d ' ')"
fi
echo "共 $IN_COUNT 帧"
write_meta

drop_truncated_jpegs
OUT_COUNT="$(find "$OUT_DIR" -maxdepth 1 -name 'frame*.jpg' | wc -l | tr -d ' ')"
echo "已完成超分: $OUT_COUNT / $IN_COUNT"

echo
echo "[2/3] Real-ESRGAN 超分..."
rm -rf "$TODO_DIR"
mkdir -p "$TODO_DIR"
python3 - "$IN_DIR" "$OUT_DIR" "$TODO_DIR" <<'PY'
import os, shutil, sys
from pathlib import Path
in_dir, out_dir, todo_dir = map(Path, sys.argv[1:])
todo = 0
for src in sorted(in_dir.glob("frame*.jpg")):
    dst = out_dir / src.name
    if dst.exists() and dst.stat().st_size > 100:
        continue
    target = todo_dir / src.name
    try:
        os.link(src, target)
    except OSError:
        shutil.copy2(src, target)
    todo += 1
print(todo)
PY
TODO_COUNT="$(find "$TODO_DIR" -maxdepth 1 -name 'frame*.jpg' | wc -l | tr -d ' ')"
echo "待处理: $TODO_COUNT 帧"

if [[ "$TODO_COUNT" -gt 0 ]]; then
  "$BIN" -i "$TODO_DIR" -o "$OUT_DIR" -m "$TOOL_DIR/models" -n "$MODEL" -s "$SCALE" -t "$TILE" -f jpg -j "$JOBS"
  drop_truncated_jpegs
fi

OUT_COUNT="$(find "$OUT_DIR" -maxdepth 1 -name 'frame*.jpg' | wc -l | tr -d ' ')"
if [[ "$OUT_COUNT" != "$IN_COUNT" ]]; then
  echo "超分未完成: $OUT_COUNT / $IN_COUNT 。进度已保留，下次执行同一命令或加 --resume 继续。" >&2
  exit 2
fi

echo
echo "[3/3] 合成 MP4..."
ffmpeg -hide_banner -loglevel error -y \
  -framerate "$ENCODE_FPS" -i "$OUT_DIR/frame%08d.jpg" \
  -i "$INPUT" \
  -map 0:v:0 -map 1:a:0? \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -shortest -movflags +faststart \
  "$OUTPUT"

echo
echo "完成: $OUTPUT"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,avg_frame_rate -show_entries format=duration,size \
  -of default=noprint_wrappers=1 "$OUTPUT"

if [[ "$CLEAN" -eq 1 ]]; then
  echo "删除进度目录: $WORK_DIR"
  rm -rf "$WORK_DIR"
fi
