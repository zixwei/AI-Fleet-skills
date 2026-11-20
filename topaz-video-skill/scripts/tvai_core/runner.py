"""Run one validated recipe with Topaz's bundled FFmpeg and gate the result.

A result is published only when every model pass showed an owned-license
checkout and no watermark fallback, and the final file has the expected frame
count, dimensions and frame rate. Ported from CanvasHub runtime.py @1587d6d.
"""
from __future__ import annotations

import json
import math
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import threading
import time
from typing import Callable, List, Tuple
import uuid

from .contracts import to_spec
from .media import MediaError, probe
from .pipeline import (MIN_CONVENTIONAL_FRAMES, advanced_passes, audio_mux_command,
                       conventional_pass, output_timing)

Progress = Callable[[dict], None]
WATERMARK_MARKERS = ("parseauth got detailsnull", "watermark will be enabled",
                     "adding watermark", "applying watermark")
LICENSE_MARKER = "license checkout successful owned"


class RunError(RuntimeError):
    pass


def missing_coreml_asset(line: str) -> str:
    if "model is not found at url" not in line.lower():
        return ""
    match = re.search(r"coreMLCache/+([^\s/]+)", line, flags=re.IGNORECASE)
    return match.group(1) if match else ""


def _stop_group(process: subprocess.Popen) -> None:
    if process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        process.wait(timeout=4)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            return
        process.wait(timeout=8)


def run_process(command: List[str], *, environment: dict, cwd: Path, log: Path,
                cancelled: threading.Event, timeout: float,
                on_line: Callable[[str], None]) -> Tuple[int, Tuple[str, ...]]:
    """Bounded subprocess + log; cancel/timeout kills the whole process group."""
    log.parent.mkdir(parents=True, exist_ok=True)
    process = subprocess.Popen(command, cwd=str(cwd), env=environment, stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, text=True,
                               errors="replace", bufsize=1, start_new_session=True)
    finished, expired = threading.Event(), threading.Event()

    def watchdog() -> None:
        deadline = time.monotonic() + timeout
        while not finished.wait(0.2):
            if cancelled.is_set() or time.monotonic() >= deadline:
                if not cancelled.is_set():
                    expired.set()
                _stop_group(process)
                return

    monitor = threading.Thread(target=watchdog, daemon=True)
    monitor.start()
    tail: List[str] = []
    written, code = 0, None
    try:
        assert process.stdout is not None
        with log.open("wb") as stream:
            for line in process.stdout:
                raw = line.encode("utf-8", "replace")
                if written < 4 * 1024 * 1024:
                    chunk = raw[:4 * 1024 * 1024 - written]
                    stream.write(chunk)
                    written += len(chunk)
                tail = (tail + [line.strip()])[-20:]
                try:
                    on_line(line)
                except Exception:  # a progress callback must never break inference
                    pass
        code = process.wait(timeout=12)
    finally:
        finished.set()
        if process.poll() is None:
            _stop_group(process)
        if process.stdout is not None:
            process.stdout.close()
        monitor.join(timeout=5)
    if cancelled.is_set():
        return -15, tuple(tail)
    if expired.is_set():
        raise RunError(f"推理超過 {int(timeout)} 秒，已停止")
    if code is None:
        raise RunError("推理子程序未正常結束")
    return code, tuple(tail)


def execute(recipe: dict, runtime: dict, directory: Path, cancelled: threading.Event,
            progress: Progress) -> dict:
    """Return ``{"path", "media", "source", "elapsed_seconds", "frames"}`` or raise RunError.

    ``runtime`` is the discovery report (ffmpeg, ffprobe, model_dir, data_dir).
    """
    if not runtime.get("model_dir"):
        raise RunError("找不到已啟用的 Topaz Video 授權；為避免浮水印已停止")
    spec = to_spec(recipe)
    ffmpeg, ffprobe = Path(runtime["ffmpeg"]), Path(runtime["ffprobe"])
    source_path = Path(recipe["source"])
    try:
        source = probe(ffprobe, source_path)
    except MediaError as exc:
        raise RunError(str(exc)) from exc
    advanced = bool(spec["filters"]) or not spec["enhancement"]
    start_frame = max(0, math.floor(source["fps"] * spec["start_seconds"]))
    if start_frame >= source["frames"]:
        raise RunError("選區起點超出影片長度")
    available = source["frames"] - start_frame
    frames = min(available, max(1, math.ceil(source["fps"] * spec["max_seconds"]))) if spec["max_seconds"] else available
    if frames < MIN_CONVENTIONAL_FRAMES:
        raise RunError(f"選區過短：Topaz 影片模型至少需要 {MIN_CONVENTIONAL_FRAMES} 幀")
    clip_start, clip_duration = start_frame / source["fps"], frames / source["fps"]
    spec = {**spec, "start_seconds": clip_start, "max_seconds": clip_duration}
    scale = spec["scale"] if spec["enhancement"] else 1
    width, height = source["width"] * scale, source["height"] * scale
    out_frames, out_fps, slowmo = output_timing(spec, source["fps"], frames)
    if width % 2 or height % 2 or width > 8192 or height > 8192:
        raise RunError(f"輸出尺寸 {width}×{height} 必須為偶數且不超過 8192 像素；請改用較小倍率")
    if advanced:
        estimated = width * height * (frames * 8 + out_frames * 4)
        if shutil.disk_usage(str(directory)).free < estimated + 512 * 1024 ** 2:
            raise RunError(f"暫存空間不足：預計需要至少 {estimated / 1024 ** 3:.1f} GiB")

    result_dir = directory / "result"
    result_dir.mkdir(parents=True, exist_ok=True)
    rendered = result_dir / f".model-{uuid.uuid4().hex}.mp4"
    muxed = result_dir / f".final-{uuid.uuid4().hex}.mp4"
    final = result_dir / "enhanced.mp4"
    if final.exists():
        raise RunError("結果已存在，不覆蓋")
    ffmpeg_dir = ffmpeg.parent
    environment = {**os.environ,
                   "PATH": os.pathsep.join([str(ffmpeg_dir), "/usr/bin", "/bin", "/usr/sbin", "/sbin"]),
                   "TVAI_MODEL_DIR": runtime["model_dir"],
                   "TVAI_MODEL_DATA_DIR": runtime.get("data_dir") or runtime["model_dir"]}
    work = directory / f".pipeline-{uuid.uuid4().hex}"
    if advanced:
        passes = advanced_passes(ffmpeg, work, spec, source_path, rendered,
                                 width=width, height=height, frames=frames, fps=source["fps"])
    else:
        passes = [conventional_pass(ffmpeg, spec, source_path, rendered, width, height, frames)]

    state = {"pass": 0, "percent": 0, "license": False, "watermark": False}
    missing: set = set()
    fields: dict = {}

    def emit(fraction: float, message: str) -> None:
        percent = min(95, max(2, int((state["pass"] + min(1, max(0, fraction))) / len(passes) * 95)))
        if percent > state["percent"]:
            state["percent"] = percent
            progress({"stage": passes[state["pass"]].label, "message": message[:200], "percent": percent})

    def on_line(line: str) -> None:
        lowered = line.lower()
        asset = missing_coreml_asset(line)
        if asset:
            missing.add(asset)
        if LICENSE_MARKER in lowered:
            state["license"] = True
        if any(marker in lowered for marker in WATERMARK_MARKERS):
            state["watermark"] = True
        if "=" in line:
            key, value = line.strip().split("=", 1)
            if key in ("frame", "fps", "progress"):
                fields[key] = value
            if key == "progress":
                try:
                    done = int(fields.get("frame", "0"))
                except ValueError:
                    return
                emit(done / out_frames, f"已處理 {done}/{out_frames} 幀（{fields.get('fps', '?')} fps）")

    timeout = min(4 * 3600, max(600, frames * 15))
    began = time.monotonic()
    try:
        if advanced:
            work.mkdir()
        for index, current in enumerate(passes):
            if cancelled.is_set():
                raise RunError("已取消")
            state.update({"pass": index, "license": False, "watermark": False})
            fields.clear()
            missing.clear()
            progress({"stage": current.label, "message": current.label,
                      "percent": max(2, int(index / len(passes) * 95))})
            code, tail = run_process(current.command, environment=environment,
                                     cwd=work if advanced else ffmpeg_dir,
                                     log=directory / f"pass-{index}.log", cancelled=cancelled,
                                     timeout=timeout, on_line=on_line)
            if cancelled.is_set():
                raise RunError("已取消")
            if code != 0:
                if missing:
                    raise RunError("模型資源不完整，缺少適配此畫面尺寸的 CoreML 變體："
                                   + "、".join(sorted(missing))
                                   + "。請在 Topaz Video App 內用同一模型處理一次同方向素材，讓 App 下載該變體")
                raise RunError(current.label + "失敗：" + " | ".join(tail[-5:])[-1000:])
            if state["watermark"]:
                raise RunError("推理程序進入浮水印回退路徑；已拒絕輸出結果")
            if current.licensed and not state["license"]:
                raise RunError("Topaz 授權未被推理程序接受（沒有 owned checkout）；已拒絕輸出可能帶浮水印的結果。"
                               "請開啟 Topaz Video App 確認已登入")
        if not rendered.is_file() or rendered.stat().st_size == 0:
            raise RunError("模型沒有產生檔案")
        info = probe(ffprobe, rendered)
        if info["frames"] != out_frames or (info["width"], info["height"]) != (width, height):
            raise RunError(f"模型結果不符：{info['frames']}/{out_frames} 幀，{info['width']}×{info['height']}/{width}×{height}")
        if source["has_audio"] and spec["encoding"]["audio"] != "mute":
            progress({"stage": "封裝結果", "message": "正在還原原音軌", "percent": 96})
            code, tail = run_process(audio_mux_command(ffmpeg, rendered, source_path, muxed,
                                                       start_seconds=clip_start, duration_seconds=clip_duration,
                                                       slowmo=slowmo),
                                     environment=environment, cwd=ffmpeg_dir, log=directory / "mux.log",
                                     cancelled=cancelled, timeout=600, on_line=lambda _line: None)
            if cancelled.is_set():
                raise RunError("已取消")
            if code:
                raise RunError("還原原音軌失敗：" + " | ".join(tail[-3:])[-700:])
            rendered.unlink()
        else:
            rendered.replace(muxed)
        final_info = probe(ffprobe, muxed)
        if final_info["frames"] != out_frames or (final_info["width"], final_info["height"]) != (width, height):
            raise RunError(f"封裝後驗收失敗：{final_info['frames']}/{out_frames} 幀，"
                           f"{final_info['width']}×{final_info['height']}/{width}×{height}")
        if abs(final_info["fps"] - out_fps) > 0.02:
            raise RunError("輸出幀率與補幀設定不符")
        os.link(str(muxed), str(final))
    except MediaError as exc:
        raise RunError(str(exc)) from exc
    finally:
        rendered.unlink(missing_ok=True)
        muxed.unlink(missing_ok=True)
        if work.exists():
            shutil.rmtree(work, ignore_errors=True)
    elapsed = time.monotonic() - began
    provenance = {"schema": 1, "watermark_verified": True,
                  "verification": "licensed_topaz_checkout" if any(p.licensed for p in passes) else "local_video_encoding",
                  "enhancement_ran": bool(spec["enhancement"]),
                  "app_version": runtime.get("app_version", ""),
                  "elapsed_seconds": round(elapsed, 2), "source_frames": frames,
                  "clip_start_seconds": clip_start, "time_scale": slowmo,
                  "media": {key: final_info[key] for key in ("width", "height", "fps", "frames", "duration", "codec_name", "pix_fmt")}}
    (result_dir / "provenance.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    progress({"stage": "完成", "message": "結果已通過驗收", "percent": 100})
    return {"path": str(final), "provenance": provenance, "source": source}
