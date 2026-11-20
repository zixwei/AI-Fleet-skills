"""Probe sources and render still frames for the agent to look at."""
from __future__ import annotations

from fractions import Fraction
import json
from pathlib import Path
import subprocess
from typing import List

MAX_DIMENSION = 7680


class MediaError(RuntimeError):
    pass


def probe(ffprobe: Path, video: Path, *, count_frames: bool = True) -> dict:
    command = [str(ffprobe), "-v", "error", "-protocol_whitelist", "file,pipe"]
    if count_frames:
        command.append("-count_frames")
    command += ["-show_entries",
                "stream=index,codec_type,codec_name,pix_fmt,color_space,color_transfer,color_primaries,"
                "width,height,nb_read_frames,nb_frames,avg_frame_rate:format=duration,size",
                "-of", "json", str(video)]
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=180, check=False)
    except subprocess.TimeoutExpired as exc:
        raise MediaError("讀取影片資訊逾時") from exc
    if result.returncode:
        raise MediaError("無法讀取影片：" + result.stderr[-400:].strip())
    try:
        data = json.loads(result.stdout)
        streams = data["streams"]
        stream = next(item for item in streams if item.get("codec_type") == "video")
        fps = float(Fraction(stream["avg_frame_rate"]))
        frames = int(stream.get("nb_read_frames") or stream.get("nb_frames") or 0)
        width, height = int(stream["width"]), int(stream["height"])
        duration = float(data.get("format", {}).get("duration") or (frames / fps if fps else 0))
        if not frames and fps and duration:
            frames = int(round(duration * fps))
    except (ValueError, TypeError, KeyError, StopIteration, ZeroDivisionError) as exc:
        raise MediaError("影片幀率、尺寸或幀數無法讀取") from exc
    if not 0 < fps <= 240 or frames <= 0 or not 0 < width <= MAX_DIMENSION or not 0 < height <= MAX_DIMENSION:
        raise MediaError(f"影片規格超出支援範圍（{width}×{height}，{fps:g} fps，{frames} 幀；上限 {MAX_DIMENSION}px）")
    return {**{key: stream.get(key, "") for key in ("codec_name", "pix_fmt", "color_space", "color_transfer", "color_primaries")},
            "width": width, "height": height, "fps": round(fps, 6), "frames": frames,
            "duration": round(duration, 6), "size_bytes": int(data.get("format", {}).get("size") or 0),
            "has_audio": any(item.get("codec_type") == "audio" for item in streams)}


def _run(command: List[str], what: str) -> None:
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=180, check=False)
    except subprocess.TimeoutExpired as exc:
        raise MediaError(what + "逾時") from exc
    if result.returncode:
        raise MediaError(what + "失敗：" + result.stderr[-400:].strip())


def extract_frames(ffmpeg: Path, video: Path, info: dict, directory: Path, *, count: int = 3,
                   max_width: int = 1280) -> List[dict]:
    """JPEG stills spread over the clip (10% / 50% / 90% by default)."""
    directory.mkdir(parents=True, exist_ok=True)
    points = [0.5] if count == 1 else [0.1 + 0.8 * index / (count - 1) for index in range(count)]
    frames = []
    for index, point in enumerate(points):
        at = max(0.0, min(info["duration"] - 1 / info["fps"], info["duration"] * point))
        target = directory / f"frame_{index + 1}_{at:.2f}s.jpg"
        _run([str(ffmpeg), "-hide_banner", "-nostdin", "-y", "-loglevel", "error", "-ss", f"{at:.3f}",
              "-i", str(video), "-frames:v", "1", "-vf", f"scale='min({max_width},iw)':-2", "-q:v", "3",
              str(target)], "擷取畫面")
        frames.append({"path": str(target), "at_seconds": round(at, 3)})
    return frames


def compare_frame(ffmpeg: Path, source: Path, source_at: float, result: Path, result_at: float,
                  result_info: dict, target: Path, *, crop: int = 720) -> dict:
    """Side-by-side crop of the same moment: left = source (upscaled), right = result."""
    width, height = result_info["width"], result_info["height"]
    size = min(crop, width, height) // 2 * 2
    x, y = (width - size) // 2 // 2 * 2, (height - size) // 2 // 2 * 2
    graph = (f"[0:v]scale={width}:{height}:flags=lanczos,crop={size}:{size}:{x}:{y}[a];"
             f"[1:v]crop={size}:{size}:{x}:{y}[b];[a][b]hstack=inputs=2[out]")
    target.parent.mkdir(parents=True, exist_ok=True)
    _run([str(ffmpeg), "-hide_banner", "-nostdin", "-y", "-loglevel", "error",
          "-ss", f"{source_at:.4f}", "-i", str(source), "-ss", f"{result_at:.4f}", "-i", str(result),
          "-filter_complex", graph, "-map", "[out]", "-frames:v", "1", str(target)], "產生對照圖")
    return {"path": str(target), "layout": "左：原片（放大到同尺寸）｜右：結果", "crop": f"{size}×{size} @ 畫面中央",
            "source_at_seconds": round(source_at, 3), "result_at_seconds": round(result_at, 3)}
