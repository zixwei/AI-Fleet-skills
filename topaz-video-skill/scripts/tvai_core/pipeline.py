"""Pure command planning for Topaz's bundled FFmpeg (no process state).

Ported from CanvasHub ``backend/topaz_video/{pipeline,runtime}.py`` @1587d6d,
minus Starlight Precise and Hyperion HDR (Neuroserver stage, phase 2).
Hard-won native quirks kept verbatim — see tests/test_pipeline.py goldens:

* exact input seeks near EOF can make ``tvai_up`` emit no frames, so a bounded
  2 s pre-roll plus an output-side seek is used;
* conventional temporal models need >= 4 frames;
* native interpolation has no successor for the last sample: pad one frame;
* slow-motion audio uses chained ``atempo`` to keep pitch;
* audio is padded before muxing so a short AAC tail cannot drop a video frame.
"""
from __future__ import annotations

from dataclasses import dataclass
import math
from pathlib import Path
from typing import List, Tuple

from .catalog import BY_ID, PARAMETER_KEYS
from .contracts import CODECS, DEFAULT_ENCODING

CONVENTIONAL_SEEK_PREROLL_SECONDS = 2.0
MIN_CONVENTIONAL_FRAMES = 4


@dataclass(frozen=True)
class Pass:
    label: str
    command: List[str]
    licensed: bool  # True when the pass runs a Topaz model and must show an owned-license checkout


def encoding_args(encoding: dict) -> List[str]:
    codec, pixels = CODECS[encoding["codec"]]
    args = ["-c:v", codec, "-pix_fmt", pixels, "-allow_sw", "1"]
    if encoding["codec"] != "h264":
        args += ["-tag:v", "hvc1"]
    if encoding["bitrate_mbps"]:
        args += ["-b:v", f"{encoding['bitrate_mbps']:g}M"]
    return args


def output_timing(spec: dict, source_fps: float, frames: int) -> Tuple[int, float, float]:
    interpolation = spec.get("filters", {}).get("interpolation", {})
    fps = float(interpolation.get("fps") or source_fps)
    slowmo = float(interpolation.get("slowmo", 1))
    return max(1, math.ceil(frames / source_fps * fps * slowmo - 1e-7)), fps, slowmo


def enhancement_filter(spec: dict, width: int, height: int) -> str:
    model = BY_ID[spec["model"]]
    parts = [f"model={model.backend_name}", "scale=0", f"w={width}", f"h={height}",
             "device=0", "instances=0", "download=0"]
    parts.extend(f"{key}={spec[key]:g}" for key in PARAMETER_KEYS)
    return "tvai_up=" + ":".join(parts)


def _base(ffmpeg: Path) -> List[str]:
    return [str(ffmpeg), "-hide_banner", "-nostdin", "-y", "-nostats", "-progress", "pipe:1"]


def conventional_pass(ffmpeg: Path, spec: dict, source: Path, output: Path,
                      width: int, height: int, frames: int) -> Pass:
    """Single-pass enhancement (no filters): the most common path."""
    command = _base(ffmpeg)
    start_seconds = float(spec.get("start_seconds") or 0)
    coarse_seek = max(0.0, start_seconds - CONVENTIONAL_SEEK_PREROLL_SECONDS)
    if coarse_seek:
        command += ["-ss", f"{coarse_seek:.8f}"]
    command += ["-i", str(source)]
    precise_seek = start_seconds - coarse_seek
    if precise_seek:
        # Output-side seek gives tvai_up a short temporal pre-roll instead of
        # an empty stream on short-GOP sources.
        command += ["-ss", f"{precise_seek:.8f}"]
    if spec["max_seconds"]:
        command += ["-t", f"{spec['max_seconds']:.8f}"]
    command += ["-frames:v", str(frames), "-filter_complex", enhancement_filter(spec, width, height),
                *encoding_args(spec.get("encoding", DEFAULT_ENCODING)),
                "-movflags", "+faststart", "-an", str(output)]
    return Pass("影片增強", command, True)


def advanced_passes(ffmpeg: Path, work: Path, spec: dict, source: Path, output: Path,
                    *, width: int, height: int, frames: int, fps: float) -> List[Pass]:
    """Multi-pass plan: clip → (camera) → stabilize/deblur/denoise/enhance → interpolate/encode."""
    filters = spec.get("filters", {})
    encoding = spec.get("encoding", DEFAULT_ENCODING)
    out_frames, out_fps, slowmo = output_timing(spec, fps, frames)
    base = _base(ffmpeg)
    intermediate = ["-c:v", "prores_ks", "-profile:v", "2", "-pix_fmt", "yuv422p10le", "-an"]
    current = work / "clip.mov"
    passes = [Pass("準備選區", base + ["-ss", f"{spec.get('start_seconds', 0):.8f}", "-i", str(source),
                                      "-frames:v", str(frames), *intermediate, str(current)], False)]
    chain = []
    stabilization = filters.get("stabilization")
    if stabilization:
        passes.append(Pass("分析相機軌跡", base + ["-i", str(current), "-vf",
                           "tvai_cpe=model=cpe-2:filename=cpe.json:device=0:download=0", "-an", "-f", "null", "-"], True))
        chain.append("tvai_stb=model=ref-2:filename=cpe.json:device=0:download=0:"
                     f"full={int(stabilization['mode'] == 'full_frame')}:smoothness={stabilization['strength']:g}:"
                     f"roll={int(stabilization['rolling_shutter'])}:reduce={stabilization['reduce_jitter']}")
    if "motion_deblur" in filters:
        chain.append("tvai_up=model=thm-2:scale=1:device=0:instances=0:download=0")
    if "denoise" in filters:
        denoise = filters["denoise"]
        chain.append(f"tvai_up=model=nyx-3:scale=1:noise={denoise['noise']:g}:details={denoise['details']:g}"
                     ":device=0:instances=0:download=0")
    if spec.get("enhancement", True):
        chain.append(enhancement_filter(spec, width, height))
    if chain:
        # Auto-crop changes native dimensions; resize its safe area explicitly.
        target = work / "processed.mov"
        chain.append(f"scale={width}:{height}")
        passes.append(Pass("穩定 / 去模糊 / 增強", base + ["-i", str(current), "-vf", ",".join(chain),
                           "-frames:v", str(frames), *intermediate, str(target)], True))
        current = target
    tail = []
    if "interpolation" in filters:
        option = filters["interpolation"]
        tail.append(f"tpad=stop_mode=clone:stop_duration={1 / fps:.8f}")
        tail.append(f"tvai_fi=model={option['model']}:fps={out_fps:g}:slowmo={slowmo:g}:"
                    f"rdt={option['rdt']:g}:device=0:instances=0:download=0")
    command = base + ["-i", str(current)]
    if tail:
        command += ["-vf", ",".join(tail)]
    command += ["-frames:v", str(out_frames), "-r", f"{out_fps:g}",
                *encoding_args(encoding), "-an", "-movflags", "+faststart", str(output)]
    passes.append(Pass("補幀 / 慢動作" if tail else "編碼影片", command, bool(tail)))
    return passes


def audio_filter(slowmo: float) -> str:
    parts = []
    speed = 1 / slowmo
    while speed < 0.5:
        parts.append("atempo=0.5")
        speed *= 2
    if abs(speed - 1) > 1e-8:
        parts.append(f"atempo={speed:g}")
    return ",".join([*parts, "apad"])


def audio_mux_command(ffmpeg: Path, rendered: Path, source: Path, output: Path,
                      *, start_seconds: float, duration_seconds: float, slowmo: float = 1) -> List[str]:
    return [str(ffmpeg), "-hide_banner", "-nostdin", "-y", "-i", str(rendered),
            "-ss", f"{start_seconds:.8f}", "-t", f"{duration_seconds:.8f}",
            "-i", str(source), "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-af", audio_filter(slowmo),
            "-shortest", "-movflags", "+faststart", str(output)]
