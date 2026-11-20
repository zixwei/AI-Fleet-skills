#!/usr/bin/env python3
"""Safely enable native request_user_input support for future Default-mode turns.

Vendored from interactive-project-skill d2d714a (MIT, (c) 2026 Interactive
Project Skill contributors). Local change: Python < 3.11 has no ``tomllib``;
report a structured error instead of crashing so the skill can fall back to
plain-text menus on a stock macOS ``/usr/bin/python3`` (3.9).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
try:
    import tomllib
except ModuleNotFoundError:  # Python < 3.11
    tomllib = None
from datetime import datetime
from pathlib import Path


FEATURE_NAME = "default_mode_request_user_input"
SCHEMA_VERSION = 1
TABLE_HEADER = re.compile(r"^\s*\[([A-Za-z0-9_.-]+)\]\s*(?:#.*)?$")
FEATURE_ASSIGNMENT = re.compile(
    rf"^(\s*{re.escape(FEATURE_NAME)}\s*=\s*)(?:true|false)(\s*(?:#.*)?)$"
)


def default_codex_home() -> Path:
    configured = os.environ.get("CODEX_HOME")
    return Path(configured).expanduser() if configured else Path.home() / ".codex"


def locate_codex(explicit: str | None) -> Path:
    candidates: list[Path] = []
    if explicit:
        candidates.append(Path(explicit).expanduser())
    discovered = shutil.which("codex")
    if discovered:
        candidates.append(Path(discovered))
    candidates.extend(
        (
            Path("/Applications/ChatGPT.app/Contents/Resources/codex"),
            Path("/Applications/Codex.app/Contents/Resources/codex"),
        )
    )
    for candidate in candidates:
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return candidate.resolve()
    raise ValueError("cannot locate an executable Codex CLI")


def parse_config(config_path: Path) -> tuple[str, bool | None]:
    if not config_path.exists():
        return "", None
    if config_path.is_symlink():
        raise ValueError(f"refusing to replace symlinked config: {config_path}")
    text = config_path.read_text(encoding="utf-8")
    try:
        data = tomllib.loads(text)
    except tomllib.TOMLDecodeError as exc:
        raise ValueError(f"invalid Codex config TOML: {exc}") from exc
    features = data.get("features")
    if features is None:
        return text, None
    if not isinstance(features, dict):
        raise ValueError("[features] must be a TOML table")
    value = features.get(FEATURE_NAME)
    if value is not None and not isinstance(value, bool):
        raise ValueError(f"features.{FEATURE_NAME} must be true or false")
    return text, value


def _split_line_ending(line: str) -> tuple[str, str]:
    if line.endswith("\r\n"):
        return line[:-2], "\r\n"
    if line.endswith("\n") or line.endswith("\r"):
        return line[:-1], line[-1]
    return line, ""


def render_enabled_config(text: str) -> str:
    newline = "\r\n" if "\r\n" in text else "\n"
    lines = text.splitlines(keepends=True)
    section_start: int | None = None
    section_end = len(lines)

    for index, line in enumerate(lines):
        body, _ = _split_line_ending(line)
        match = TABLE_HEADER.match(body)
        if not match:
            continue
        if section_start is not None:
            section_end = index
            break
        if match.group(1) == "features":
            section_start = index

    if section_start is not None:
        for index in range(section_start + 1, section_end):
            body, ending = _split_line_ending(lines[index])
            match = FEATURE_ASSIGNMENT.match(body)
            if match:
                lines[index] = f"{match.group(1)}true{match.group(2)}{ending}"
                updated = "".join(lines)
                tomllib.loads(updated)
                return updated

        insert_at = section_end
        while insert_at > section_start + 1:
            body, _ = _split_line_ending(lines[insert_at - 1])
            if body.strip():
                break
            insert_at -= 1
        if insert_at > 0:
            body, ending = _split_line_ending(lines[insert_at - 1])
            if body and not ending:
                lines[insert_at - 1] += newline
        lines.insert(insert_at, f"{FEATURE_NAME} = true{newline}")
        updated = "".join(lines)
        tomllib.loads(updated)
        return updated

    updated = text
    if updated and not updated.endswith(("\n", "\r")):
        updated += newline
    if updated and not updated.endswith(newline * 2):
        updated += newline
    updated += f"[features]{newline}{FEATURE_NAME} = true{newline}"
    tomllib.loads(updated)
    return updated


def probe_feature(codex_bin: Path, codex_home: Path, strict: bool = False) -> dict[str, object]:
    command = [str(codex_bin)]
    if strict:
        command.append("--strict-config")
    command.extend(("features", "list"))
    environment = os.environ.copy()
    environment["CODEX_HOME"] = str(codex_home)
    result = subprocess.run(
        command,
        text=True,
        capture_output=True,
        check=False,
        env=environment,
    )
    if result.returncode != 0:
        details = result.stderr.strip() or result.stdout.strip() or "unknown error"
        if (
            strict
            and "--strict-config" in details
            and "not supported for" in details
            and "codex features" in details
        ):
            return probe_feature(codex_bin, codex_home, strict=False)
        raise RuntimeError(f"Codex feature probe failed: {details}")

    for line in result.stdout.splitlines():
        parts = line.split()
        if not parts or parts[0] != FEATURE_NAME:
            continue
        if parts[-1] not in {"true", "false"}:
            raise RuntimeError(f"unexpected feature status line: {line}")
        return {
            "supported": True,
            "effective_enabled": parts[-1] == "true",
            "stage": " ".join(parts[1:-1]),
        }
    return {
        "supported": False,
        "effective_enabled": False,
        "stage": None,
    }


def status_payload(
    codex_home: Path,
    config_path: Path,
    codex_bin: Path,
    probe: dict[str, object],
    config_enabled: bool | None,
) -> dict[str, object]:
    supported = bool(probe["supported"])
    effective = bool(probe["effective_enabled"])
    if not supported:
        status = "unsupported"
        needs_apply = False
    elif effective:
        status = "enabled"
        needs_apply = False
    elif config_enabled is True:
        status = "overridden"
        needs_apply = False
    else:
        status = "disabled"
        needs_apply = True
    return {
        "schema_version": SCHEMA_VERSION,
        "feature": FEATURE_NAME,
        "status": status,
        "supported": supported,
        "stage": probe["stage"],
        "effective_enabled": effective,
        "config_enabled": config_enabled,
        "needs_apply": needs_apply,
        "changed": False,
        "restart_required": False,
        "backup_path": None,
        "codex_home": str(codex_home),
        "config_path": str(config_path),
        "codex_bin": str(codex_bin),
    }


def atomic_write(path: Path, text: str, mode: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.",
        suffix=".tmp",
        dir=path.parent,
    )
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary, mode)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def unique_backup_path(config_path: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    candidate = config_path.with_name(f"{config_path.name}.bak-{timestamp}")
    counter = 1
    while candidate.exists():
        candidate = config_path.with_name(
            f"{config_path.name}.bak-{timestamp}-{counter}"
        )
        counter += 1
    return candidate


def apply_configuration(
    codex_home: Path,
    config_path: Path,
    codex_bin: Path,
) -> dict[str, object]:
    original_exists = config_path.exists()
    original_text, config_enabled = parse_config(config_path)
    initial_probe = probe_feature(codex_bin, codex_home)
    initial = status_payload(
        codex_home,
        config_path,
        codex_bin,
        initial_probe,
        config_enabled,
    )
    if initial["status"] == "enabled":
        return initial
    if initial["status"] == "unsupported":
        raise ValueError(
            f"this Codex build does not expose feature {FEATURE_NAME}"
        )
    if initial["status"] == "overridden":
        raise ValueError(
            f"{FEATURE_NAME} is enabled in config but disabled by a higher-priority "
            "runtime or managed requirement"
        )

    updated = render_enabled_config(original_text)
    original_mode = (
        config_path.stat().st_mode & 0o777 if original_exists else 0o600
    )
    backup: Path | None = None
    if original_exists:
        backup = unique_backup_path(config_path)
        shutil.copy2(config_path, backup)

    try:
        atomic_write(config_path, updated, original_mode)
        _, updated_value = parse_config(config_path)
        if updated_value is not True:
            raise RuntimeError("written config does not enable the requested feature")
        verified_probe = probe_feature(codex_bin, codex_home, strict=True)
        if not verified_probe["supported"] or not verified_probe["effective_enabled"]:
            raise RuntimeError(
                "Codex did not report the feature as enabled after configuration"
            )
    except (OSError, RuntimeError, ValueError) as exc:
        if original_exists:
            atomic_write(config_path, original_text, original_mode)
        else:
            config_path.unlink(missing_ok=True)
        raise RuntimeError(f"configuration failed and was rolled back: {exc}") from exc

    result = status_payload(
        codex_home,
        config_path,
        codex_bin,
        verified_probe,
        True,
    )
    result.update(
        {
            "status": "configured",
            "changed": True,
            "restart_required": True,
            "backup_path": str(backup) if backup else None,
        }
    )
    return result


def render_human(result: dict[str, object]) -> str:
    status = result["status"]
    if status == "enabled":
        return "Default-mode native user input is already enabled."
    if status == "configured":
        backup = (
            f" Backup: {result['backup_path']}." if result["backup_path"] else ""
        )
        return (
            "Enabled Default-mode native user input for future Codex processes."
            f"{backup} Fully restart Codex before invoking the skill again."
        )
    if status == "disabled":
        return (
            "Default-mode native user input is supported but disabled. "
            "Obtain explicit user consent, then re-run with --apply."
        )
    if status == "overridden":
        return (
            "The config enables native input, but a higher-priority policy disables it. "
            "Use Plan mode or the plain-text fallback."
        )
    return (
        "This Codex build does not expose Default-mode native user input. "
        "Use Plan mode or the plain-text fallback."
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Inspect or safely enable Default-mode request_user_input for future "
            "Codex processes."
        )
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="back up and update config.toml; without this flag the command is read-only",
    )
    parser.add_argument("--json", action="store_true")
    parser.add_argument(
        "--codex-home",
        type=Path,
        default=default_codex_home(),
        help=argparse.SUPPRESS,
    )
    parser.add_argument("--codex-bin", help=argparse.SUPPRESS)
    args = parser.parse_args()

    try:
        if tomllib is None:
            raise RuntimeError("Python 3.11+ is required to edit config.toml safely; "
                               "add `default_mode_request_user_input = true` under [features] manually")
        codex_home = args.codex_home.expanduser().resolve()
        config_path = codex_home / "config.toml"
        codex_bin = locate_codex(args.codex_bin)
        if args.apply:
            result = apply_configuration(codex_home, config_path, codex_bin)
        else:
            _, config_enabled = parse_config(config_path)
            probe = probe_feature(codex_bin, codex_home)
            result = status_payload(
                codex_home,
                config_path,
                codex_bin,
                probe,
                config_enabled,
            )
        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(render_human(result))
        return 0
    except (OSError, RuntimeError, ValueError) as exc:
        if args.json:
            print(
                json.dumps(
                    {
                        "schema_version": SCHEMA_VERSION,
                        "feature": FEATURE_NAME,
                        "status": "error",
                        "error": str(exc),
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
        else:
            print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
