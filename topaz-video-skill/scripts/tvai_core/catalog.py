"""Model, parameter and filter metadata (no availability decisions here)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple


@dataclass(frozen=True)
class Model:
    id: str
    label: str
    family: str
    backend_name: str          # tvai_up model= value
    scales: Tuple[int, ...]    # multipliers verified on the CanvasHub reference Mac
    weight_prefixes: Tuple[str, ...]
    support: Tuple[str, ...]   # auxiliary descriptor/weight files the filter loads


GENERAL_PARAMETERS = (
    {"key": "preblur", "label": "去鋸齒 / 去模糊", "min": -1, "max": 1, "step": 0.05, "default": 0},
    {"key": "noise", "label": "降噪", "min": 0, "max": 1, "step": 0.05, "default": 0},
    {"key": "details", "label": "恢復細節", "min": 0, "max": 1, "step": 0.05, "default": 0},
    {"key": "halo", "label": "去光暈", "min": 0, "max": 1, "step": 0.05, "default": 0},
    {"key": "blur", "label": "銳化", "min": 0, "max": 1, "step": 0.05, "default": 0},
    {"key": "compression", "label": "壓縮修復", "min": 0, "max": 1, "step": 0.05, "default": 0},
    {"key": "prenoise", "label": "輸入加噪", "min": 0, "max": 0.1, "step": 0.01, "default": 0},
    {"key": "blend", "label": "原片混合", "min": 0, "max": 1, "step": 0.05, "default": 0},
    {"key": "grain", "label": "膠片顆粒", "min": 0, "max": 1, "step": 0.05, "default": 0},
    # Topaz advertises 0–5 but its native filter rejects fractional non-zero
    # sizes; 0 means automatic, explicit sizes are integers 1–5.
    {"key": "gsize", "label": "顆粒尺寸", "min": 0, "max": 5, "step": 1, "default": 0, "integer": True},
)
PARAMETERS = {item["key"]: item for item in GENERAL_PARAMETERS}
PARAMETER_KEYS = tuple(item["key"] for item in GENERAL_PARAMETERS)

_PRAP = ("prap-3.json", "prap-v3-fp16-ml.tz3")
_NAP = ("nap-3.json", "nap-v3-fp16-ml.tz3")

# Starlight Precise / Mini and Hyperion HDR need the separately validated
# Neuroserver stage and are deliberately not part of this skill (phase 1).
MODELS: Tuple[Model, ...] = (
    Model("proteus-v4", "Proteus v4", "enhance", "prob-4", (1, 4), ("prob-v4-",), _PRAP),
    Model("nyx-v3", "Nyx v3", "denoise", "nyx-3", (1, 2), ("nyx-v3-",), _NAP),
    Model("theia-v4", "Theia Fine Tune Fidelity v4", "enhance", "thf-4", (1, 2), ("thf-v4-",), _PRAP),
    Model("iris", "Iris Medium Quality v2", "face", "iris-2", (1,), ("iris-v2-",), _PRAP),
    Model("rhea", "Rhea v1", "upscale", "rhea-1", (1, 2, 4), ("rhea-v1-",), _PRAP),
    Model("artemis", "Artemis High Quality v12", "enhance", "ahq-12", (2,), ("ahq-v12-",), ()),
    Model("gaia", "Gaia High Quality v5", "upscale", "ghq-5", (2,), ("ghq-v5-",), ()),
    Model("gaia-animation", "Gaia Animation v1", "upscale", "ganim-1", (2,), ("ganim-v1-",), ()),
)
BY_ID: Dict[str, Model] = {item.id: item for item in MODELS}

# Composable filters: id -> (label, weight prefix)
FEATURE_MODELS = {
    "chf-3": ("Chronos Fast 3", "chf-v3-"),
    "chr-2": ("Chronos 2", "chr-v2-"),
    "apo-8": ("Apollo 8", "apo-v8-"),
    "apf-2": ("Apollo Fast 2", "apf-v2-"),
    "thm-2": ("Themis 2", "thm-v2-"),
    "ref-2": ("Refine 2（全幀穩定）", "ref-v2-"),
    "cpe-2": ("CPE 2（相機軌跡）", "cpe-v2-"),
    "ifi-1": ("IFI 1（抖動修復）", "ifi-v1-"),
    "nyx-3": ("Nyx 3", "nyx-v3-"),
}
INTERPOLATION_MODELS = ("chf-3", "chr-2", "apo-8", "apf-2")
