"""Built-in and user presets, candidate-chain resolution and recipe overrides."""
from __future__ import annotations

import json
from pathlib import Path
import re
from typing import Dict, List, Optional

from .catalog import BY_ID, PARAMETERS

BUILTIN = Path(__file__).resolve().parents[2] / "presets/builtin.json"
FILTER_ALIASES = {"denoise": "denoise", "nyx": "denoise",
                  "interp": "interpolation", "interpolation": "interpolation", "fps": "interpolation",
                  "stabilize": "stabilization", "stabilization": "stabilization",
                  "deblur": "motion_deblur", "motion_deblur": "motion_deblur"}
USER_KEYS = {"id", "label", "category", "detail", "intents", "choices", "params", "filters", "encoding", "source_job"}
NAME = re.compile(r"^[a-z0-9][a-z0-9-]{0,39}$")


def load_builtin() -> dict:
    return json.loads(BUILTIN.read_text(encoding="utf-8"))


def load_user(directory: Path) -> List[dict]:
    presets = []
    for path in sorted(directory.glob("*.json")) if directory.is_dir() else []:
        try:
            item = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(item, dict) and NAME.match(str(item.get("id", ""))) and not set(item) - USER_KEYS:
            presets.append({**item, "category": "mine", "user": True})
    return presets


def all_presets(user_dir: Path) -> List[dict]:
    builtin = load_builtin()["presets"]
    names = {item["id"] for item in builtin}
    return builtin + [item for item in load_user(user_dir) if item["id"] not in names]


def find(user_dir: Path, preset_id: str) -> dict:
    for item in all_presets(user_dir):
        if item["id"] == preset_id:
            return item
    raise ValueError(f"未知預設 {preset_id!r}；執行 `tvai.py presets` 查看可用預設")


def resolve(preset: dict, inventory: dict, verified: Dict[str, List[int]]) -> Optional[dict]:
    """First locally available (model, scale) in the preset's ordered choices."""
    for model_id, scale in preset.get("choices", []):
        entry = inventory["models"].get(model_id)
        model = BY_ID.get(model_id)
        if entry and model and entry["available"] and scale in model.scales:
            return {"model": model_id, "scale": scale, "label": model.label,
                    "verified": scale in verified.get(model_id, [])}
    return None


def describe(preset: dict, inventory: dict, verified: Dict[str, List[int]]) -> dict:
    resolved = resolve(preset, inventory, verified)
    reasons = []
    if not resolved:
        for model_id, scale in preset.get("choices", []):
            entry = inventory["models"].get(model_id)
            if entry and entry["reason"]:
                reasons.append(f"{entry['label']} {scale}×：{entry['reason']}")
    return {"id": preset["id"], "label": preset["label"], "category": preset.get("category"),
            "detail": preset.get("detail", ""), "user": bool(preset.get("user")),
            "available": bool(resolved), "resolved": resolved,
            "extras": {key: preset[key] for key in ("params", "filters", "encoding") if preset.get(key)},
            "unavailable_reasons": reasons[:3]}


def parse_value(text: str):
    lowered = text.strip().lower()
    if lowered in ("true", "false"):
        return lowered == "true"
    try:
        number = float(text)
    except ValueError:
        return text.strip()
    return int(number) if number.is_integer() and "." not in text else number


def apply_set(params: dict, items: List[str], warnings: List[str]) -> None:
    """``key=0.3`` sets a value; ``key+=0.2`` / ``key-=0.1`` adjusts and clamps to range."""
    for item in items:
        match = re.match(r"^\s*([a-z_]+)\s*([+-]?=)\s*(.+?)\s*$", item)
        if not match:
            raise ValueError(f"--set 格式應為 key=value、key+=delta 或 key-=delta，收到 {item!r}")
        key, operator, raw = match.groups()
        if key not in PARAMETERS:
            raise ValueError(f"未知參數 {key!r}，可用：{', '.join(PARAMETERS)}")
        definition = PARAMETERS[key]
        if operator == "=":
            params[key] = parse_value(raw)
        else:
            try:
                delta = float(raw)
            except ValueError as exc:
                raise ValueError(f"{key}{operator} 後面必須是數字") from exc
            value = float(params.get(key, definition["default"])) + (delta if operator == "+=" else -delta)
            clamped = min(definition["max"], max(definition["min"], value))
            if abs(clamped - value) > 1e-9:
                warnings.append(f"{key} 調整後超出範圍，已限制為 {clamped:g}")
            params[key] = int(round(clamped)) if definition.get("integer") else round(clamped, 4)


def parse_filter(text: str) -> tuple:
    name, _, rest = text.partition(":")
    key = FILTER_ALIASES.get(name.strip().lower())
    if not key:
        raise ValueError(f"未知濾鏡 {name!r}，可用：denoise / interp / stabilize / deblur")
    options = {}
    for part in filter(None, (piece.strip() for piece in rest.split(","))):
        if "=" not in part:
            # shorthand: interp:60 -> fps=60
            if key == "interpolation":
                options["fps"] = parse_value(part)
                continue
            raise ValueError(f"濾鏡參數格式應為 key=value，收到 {part!r}")
        option, value = part.split("=", 1)
        options[option.strip()] = parse_value(value)
    return key, options


def build_recipe(*, source: str, preset: Optional[dict], inventory: dict, verified: Dict[str, List[int]],
                 model: Optional[str], scale: Optional[int], sets: List[str], adds: List[str],
                 removes: List[str], codec: Optional[str], audio: Optional[str], bitrate: Optional[float],
                 kind: str, start: float, seconds: Optional[float], base: Optional[dict] = None) -> tuple:
    """Merge base recipe ← preset ← explicit overrides. Returns (raw_recipe, warnings)."""
    warnings: List[str] = []
    recipe = json.loads(json.dumps(base)) if base else {"params": {}, "filters": {}, "encoding": {}}
    recipe["source"] = source
    if preset:
        resolved = resolve(preset, inventory, verified)
        if not resolved and not model:
            raise ValueError(f"預設「{preset['label']}」在這台機器上沒有可用模型："
                             + "；".join(describe(preset, inventory, verified)["unavailable_reasons"]))
        if resolved:
            recipe.update(model=resolved["model"], scale=resolved["scale"])
        recipe["preset"] = preset["id"]
        recipe["params"] = {**recipe.get("params", {}), **preset.get("params", {})}
        recipe["filters"] = {**recipe.get("filters", {}), **preset.get("filters", {})}
        recipe["encoding"] = {**recipe.get("encoding", {}), **preset.get("encoding", {})}
    if model:
        if model not in BY_ID:
            raise ValueError(f"未知模型 {model!r}，可用：{', '.join(BY_ID)}")
        recipe["model"] = model
        if scale is None and recipe.get("scale") not in BY_ID[model].scales:
            recipe.pop("scale", None)
    recipe.setdefault("preset", None)
    if scale is not None:
        recipe["scale"] = scale
    if "model" not in recipe:
        raise ValueError("請指定 --preset 或 --model")
    apply_set(recipe.setdefault("params", {}), sets, warnings)
    for text in adds:
        key, options = parse_filter(text)
        recipe["filters"][key] = {**recipe["filters"].get(key, {}), **options}
    for text in removes:
        key = FILTER_ALIASES.get(text.strip().lower())
        if not key:
            raise ValueError(f"未知濾鏡 {text!r}")
        recipe["filters"].pop(key, None)
    encoding = recipe.setdefault("encoding", {})
    if codec:
        encoding["codec"] = codec
    if audio:
        encoding["audio"] = audio
    if bitrate is not None:
        encoding["bitrate_mbps"] = bitrate
    recipe["kind"] = kind
    recipe["start_seconds"] = start
    recipe["max_seconds"] = seconds if seconds is not None else (3 if kind == "preview" else 0)
    return recipe, warnings
