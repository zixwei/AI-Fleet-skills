"""Locate the installed Topaz Video app, its license context and local weights.

Everything here is read-only. A descriptor (``*.json``) alone never makes a
model available; weights must be present in the app's model-data folder. The
license file is located, never read, copied or returned.
"""
from __future__ import annotations

import os
from pathlib import Path
import platform
import plistlib
import sys
from typing import Dict, List, Optional

from .catalog import FEATURE_MODELS, INTERPOLATION_MODELS, MODELS

APP_CANDIDATES = (
    Path("/Applications/Topaz Video.app"),
    Path("/Applications/Topaz Video AI.app"),
    Path.home() / "Applications/Topaz Video.app",
    Path.home() / "Applications/Topaz Video AI.app",
)
PREFERENCE_FILES = (
    Path.home() / "Library/Preferences/com.topazlabs.Topaz Video.plist",
    Path.home() / "Library/Preferences/com.topazlabs.Topaz-Video.plist",
    Path.home() / "Library/Preferences/com.topazlabs.Topaz Video AI.plist",
)
# Version this skill's command plans were ported and validated against.
REFERENCE_APP_VERSION = "1.7.1"


def _executable(path: Path) -> bool:
    return path.is_file() and os.access(path, os.X_OK)


def find_app() -> Optional[Path]:
    configured = os.environ.get("TVAI_APP", "").strip()
    candidates = ([Path(configured).expanduser()] if configured else []) + list(APP_CANDIDATES)
    for app in candidates:
        if _executable(app / "Contents/MacOS/ffmpeg") and _executable(app / "Contents/MacOS/ffprobe"):
            return app
    return None


def app_version(app: Path) -> str:
    try:
        with (app / "Contents/Info.plist").open("rb") as stream:
            return str(plistlib.load(stream).get("CFBundleShortVersionString", ""))
    except (OSError, ValueError, plistlib.InvalidFileException):
        return ""


def preferred_data_folder(app: Path) -> Optional[Path]:
    """The app's model download folder (``veaiDataFolder``), if configured."""
    for preference in PREFERENCE_FILES:
        try:
            with preference.open("rb") as stream:
                value = plistlib.load(stream).get("veaiDataFolder")
        except (OSError, ValueError, plistlib.InvalidFileException):
            continue
        if isinstance(value, str) and value.strip():
            path = Path(value.strip()).expanduser()
            if not path.is_absolute():
                path = app / "Contents/MacOS" / path
            return Path(os.path.normpath(str(path)))
    return None


def _license_usable(directory: Path) -> bool:
    license_file = directory / "license.lic"
    try:
        return (directory.is_dir() and license_file.is_file() and not license_file.is_symlink()
                and license_file.stat().st_size > 0)
    except OSError:
        return False


def discover() -> dict:
    """Return a JSON-safe description of this machine's Topaz Video runtime."""
    supported = sys.platform == "darwin" and platform.machine() == "arm64"
    app = find_app()
    report: dict = {
        "platform_supported": supported,
        "app": str(app) if app else None,
        "app_version": app_version(app) if app else "",
        "reference_app_version": REFERENCE_APP_VERSION,
        "model_dir": None, "data_dir": None, "licensed": False,
        "ffmpeg": None, "ffprobe": None, "problems": [],
    }
    if not supported:
        report["problems"].append("僅支援 Apple Silicon macOS（模型為 CoreML 格式）")
    if not app:
        report["problems"].append("找不到 Topaz Video App（可用環境變數 TVAI_APP 指定 .app 路徑）")
        return report
    bundled = app / "Contents/Resources/models"
    configured = os.environ.get("TVAI_MODEL_DATA_DIR", "").strip()
    data_dir = Path(configured).expanduser() if configured else (preferred_data_folder(app) or bundled)
    license_candidates = [Path(p).expanduser() for p in (os.environ.get("TVAI_LICENSE_DIR", "").strip(),) if p]
    license_candidates += [bundled, data_dir]
    model_dir = next((path for path in license_candidates if _license_usable(path)), None)
    report.update({
        "ffmpeg": str(app / "Contents/MacOS/ffmpeg"),
        "ffprobe": str(app / "Contents/MacOS/ffprobe"),
        "data_dir": str(data_dir) if data_dir.is_dir() else None,
        "model_dir": str(model_dir) if model_dir else None,
        "licensed": bool(model_dir),
    })
    if not data_dir.is_dir():
        report["problems"].append(f"模型資料夾不存在：{data_dir}")
    if not model_dir:
        report["problems"].append("找不到已啟用的 Topaz Video 授權；請先開啟 App 登入。為避免浮水印，不會執行任何增強")
    return report


def _files(directory: Optional[str]) -> List[str]:
    if not directory:
        return []
    try:
        return sorted(entry.name for entry in os.scandir(directory) if entry.is_file())
    except OSError:
        return []


def inventory(report: dict) -> dict:
    """Which enhancement models and filters have descriptors + weights locally."""
    descriptors = set(_files(report.get("model_dir"))) | set(_files(report.get("data_dir")))
    weights = [name for name in _files(report.get("data_dir")) if name.endswith(".tz3")]
    present = set(descriptors) | set(weights)
    licensed = bool(report.get("licensed")) and bool(report.get("platform_supported"))

    models: Dict[str, dict] = {}
    for model in MODELS:
        found = [name for name in weights if name.startswith(model.weight_prefixes)]
        missing = [name for name in (model.backend_name + ".json", "tvai.tz", *model.support) if name not in present]
        if not found:
            missing.append(model.weight_prefixes[0] + "*.tz3")
        ready = not missing
        models[model.id] = {
            "id": model.id, "label": model.label, "family": model.family,
            "scales": list(model.scales), "weights": found,
            "available": ready and licensed,
            "reason": ("" if ready and licensed else
                       "本機授權不可用" if ready else
                       f"請在 Topaz Video App 內下載 {model.label}（缺少 {', '.join(missing[:3])}）"),
        }

    def feature(ident: str) -> dict:
        label, prefix = FEATURE_MODELS[ident]
        ready = (ident + ".json") in present and any(name.startswith(prefix) for name in weights)
        return {"id": ident, "label": label, "available": ready and licensed,
                "reason": "" if ready and licensed else "本機授權不可用" if ready else f"請在 Topaz Video App 內下載 {label}"}

    interpolation = [feature(key) for key in INTERPOLATION_MODELS]
    deblur, cpe, ref, ifi, nyx = (feature(key) for key in ("thm-2", "cpe-2", "ref-2", "ifi-1", "nyx-3"))
    filters = {
        "denoise": {"available": nyx["available"], "reason": nyx["reason"]},
        "interpolation": {"available": any(item["available"] for item in interpolation), "models": interpolation,
                          "reason": "" if any(item["available"] for item in interpolation)
                          else "請在 Topaz Video App 內下載任一補幀模型（Chronos / Apollo）"},
        "motion_deblur": {"available": deblur["available"], "models": [deblur], "reason": deblur["reason"]},
        "stabilization": {"available": cpe["available"], "full_frame": cpe["available"] and ref["available"],
                          "jitter": interpolation[0]["available"] and ifi["available"], "reason": cpe["reason"]},
    }
    return {"models": models, "filters": filters}
