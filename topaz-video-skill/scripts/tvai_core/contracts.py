"""Recipe validation: the only shape a job may be started from.

A recipe is a self-describing, reproducible JSON document. Unknown fields,
unknown models, out-of-range parameters and invalid filter combinations are
rejected here, before any GPU work. Ported from CanvasHub contracts/features.
"""
from __future__ import annotations

import math
from pathlib import Path

from .catalog import BY_ID, INTERPOLATION_MODELS, PARAMETERS

SCHEMA = 1
MAX_SECONDS = 600
MAX_START_SECONDS = 24 * 60 * 60
CODECS = {"h264": ("h264_videotoolbox", "yuv420p"),
          "hevc": ("hevc_videotoolbox", "yuv420p"),
          "hevc10": ("hevc_videotoolbox", "p010le")}
DEFAULT_ENCODING = {"codec": "h264", "bitrate_mbps": 0, "audio": "aac"}
RECIPE_KEYS = {"schema", "source", "preset", "kind", "start_seconds", "max_seconds",
               "enhancement", "model", "scale", "params", "filters", "encoding"}


def _finite(value) -> bool:
    return not isinstance(value, bool) and isinstance(value, (int, float)) and math.isfinite(value)


def _object(value, keys, label) -> dict:
    if not isinstance(value, dict) or set(value) - set(keys):
        raise ValueError(f"{label} 包含不支援的參數：{sorted(set(value) - set(keys)) if isinstance(value, dict) else value}")
    return value


def _number(value, low, high, label, *, integer=False):
    if not _finite(value) or not low <= value <= high or (integer and int(value) != value):
        raise ValueError(f"{label} 須為 {low}–{high} 範圍內的{'整數' if integer else '有限數字'}")
    return int(value) if integer else value


def normalize_filters(raw) -> dict:
    filters = _object(raw if raw is not None else {}, ("denoise", "interpolation", "stabilization", "motion_deblur"), "filters")
    result = {}
    for key, value in filters.items():
        if key == "denoise":
            _object(value, ("noise", "details"), key)
            result[key] = {"noise": _number(value.get("noise", 0), 0, 1, "denoise.noise"),
                           "details": _number(value.get("details", 0), 0, 1, "denoise.details")}
        elif key == "interpolation":
            _object(value, ("model", "fps", "slowmo", "rdt"), key)
            model = value.get("model", "chf-3")
            if model not in INTERPOLATION_MODELS:
                raise ValueError(f"未知補幀模型 {model}，可用：{', '.join(INTERPOLATION_MODELS)}")
            fps = _number(value.get("fps", 60), 0, 120, "interpolation.fps")
            if fps and fps < 1:
                raise ValueError("interpolation.fps 須為 0（跟隨原片）或 1–120")
            result[key] = {"model": model, "fps": fps,
                           "slowmo": _number(value.get("slowmo", 1), 1, 16, "interpolation.slowmo"),
                           "rdt": _number(value.get("rdt", 0.01), -0.01, 0.2, "interpolation.rdt")}
        elif key == "stabilization":
            _object(value, ("mode", "strength", "rolling_shutter", "reduce_jitter"), key)
            mode = value.get("mode", "auto_crop")
            if mode not in ("auto_crop", "full_frame"):
                raise ValueError("stabilization.mode 僅支援 auto_crop / full_frame")
            rolling = value.get("rolling_shutter", False)
            if not isinstance(rolling, bool):
                raise ValueError("stabilization.rolling_shutter 須為布林值")
            result[key] = {"mode": mode, "strength": _number(value.get("strength", 6), 0, 16, "stabilization.strength"),
                           "rolling_shutter": rolling,
                           "reduce_jitter": _number(value.get("reduce_jitter", 0), 0, 5, "stabilization.reduce_jitter", integer=True)}
        else:
            _object(value, ("model",), key)
            if value.get("model", "thm-2") != "thm-2":
                raise ValueError("motion_deblur 僅支援 thm-2")
            result[key] = {"model": "thm-2"}
    return result


def normalize_encoding(raw) -> dict:
    encoding = {**DEFAULT_ENCODING, **_object(raw if raw is not None else {}, DEFAULT_ENCODING, "encoding")}
    if encoding["codec"] not in CODECS:
        raise ValueError(f"encoding.codec 僅支援 {', '.join(CODECS)}")
    if encoding["audio"] not in ("aac", "mute"):
        raise ValueError("encoding.audio 僅支援 aac / mute")
    _number(encoding["bitrate_mbps"], 0, 200, "encoding.bitrate_mbps")
    return encoding


def normalize_params(model_id: str, raw) -> dict:
    params = _object(raw if raw is not None else {}, PARAMETERS, "params")
    result = {}
    for key, definition in PARAMETERS.items():
        value = params.get(key, definition["default"])
        result[key] = _number(value, definition["min"], definition["max"], f"params.{key}",
                              integer=bool(definition.get("integer")))
        if not definition.get("integer"):
            result[key] = round(float(result[key]), 4)
    return result


def normalize_recipe(raw) -> dict:
    if not isinstance(raw, dict):
        raise ValueError("配方必須為 JSON 物件")
    unknown = set(raw) - RECIPE_KEYS
    if unknown:
        raise ValueError(f"配方包含未知欄位：{sorted(unknown)}")
    if raw.get("schema", SCHEMA) != SCHEMA:
        raise ValueError(f"不支援的配方版本 {raw.get('schema')}")
    source = raw.get("source")
    if not isinstance(source, str) or not source:
        raise ValueError("配方缺少 source（原片絕對路徑）")
    source_path = Path(source).expanduser()
    if not source_path.is_absolute():
        raise ValueError("source 必須是絕對路徑")
    kind = raw.get("kind", "preview")
    if kind not in ("preview", "export"):
        raise ValueError("kind 僅支援 preview / export")
    start = raw.get("start_seconds", 0)
    if not _finite(start) or not 0 <= start <= MAX_START_SECONDS:
        raise ValueError(f"start_seconds 須為 0–{MAX_START_SECONDS} 秒")
    seconds = raw.get("max_seconds", 3 if kind == "preview" else 0)
    if not _finite(seconds) or not 0 <= seconds <= MAX_SECONDS:
        raise ValueError(f"max_seconds 須為 0–{MAX_SECONDS} 秒（0 表示處理到片尾）")
    if kind == "preview" and seconds <= 0:
        raise ValueError("預覽必須指定大於 0 的 max_seconds")
    enhancement = raw.get("enhancement", True)
    if not isinstance(enhancement, bool):
        raise ValueError("enhancement 須為布林值")
    model = BY_ID.get(raw.get("model")) if isinstance(raw.get("model"), str) else None
    if model is None:
        raise ValueError(f"未知模型 {raw.get('model')!r}，可用：{', '.join(BY_ID)}")
    scales = (1,) if not enhancement else model.scales
    scale = raw.get("scale", scales[0])
    if isinstance(scale, bool) or not isinstance(scale, int) or scale not in scales:
        raise ValueError(f"{model.label} 不支援 {scale}×，可用倍率：{', '.join(f'{s}×' for s in scales)}")
    filters = normalize_filters(raw.get("filters"))
    if not enhancement and not filters:
        raise ValueError("enhancement=false 時至少要啟用一個濾鏡")
    preset = raw.get("preset")
    if preset is not None and not isinstance(preset, str):
        raise ValueError("preset 須為字串")
    return {
        "schema": SCHEMA, "source": str(source_path), "preset": preset, "kind": kind,
        "start_seconds": float(start), "max_seconds": float(seconds),
        "enhancement": enhancement, "model": model.id, "scale": scale,
        "params": normalize_params(model.id, raw.get("params")),
        "filters": filters, "encoding": normalize_encoding(raw.get("encoding")),
    }


def to_spec(recipe: dict) -> dict:
    """Flatten a normalized recipe into the pipeline's spec shape."""
    spec = {key: recipe[key] for key in ("model", "scale", "start_seconds", "max_seconds",
                                         "enhancement", "filters", "encoding")}
    spec["task_kind"] = recipe["kind"]
    spec.update(recipe["params"])
    return spec


def validate_capabilities(recipe: dict, inventory: dict) -> None:
    """Fail before queueing when this machine lacks a needed model or filter."""
    if recipe["enhancement"]:
        entry = inventory["models"].get(recipe["model"])
        if not entry or not entry["available"]:
            raise ValueError(entry["reason"] if entry else "未知模型")
    for key, value in recipe["filters"].items():
        feature = inventory["filters"].get(key, {})
        if not feature.get("available"):
            raise ValueError(feature.get("reason") or f"{key} 尚未就緒")
        if key in ("interpolation", "motion_deblur") and not any(
                item["id"] == value["model"] and item["available"] for item in feature.get("models", [])):
            raise ValueError(f"{value['model']} 模型權重尚未下載")
        if key == "stabilization":
            if value["mode"] == "full_frame" and not feature.get("full_frame"):
                raise ValueError("全幀穩定還需要下載 Refine 2 模型")
            if (value["rolling_shutter"] or value["reduce_jitter"]) and not feature.get("jitter"):
                raise ValueError("滾動快門 / 抖動修復還需要下載 Chronos Fast 3 和 IFI 1")
