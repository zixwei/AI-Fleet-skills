"""Durable job records, detached workers, GPU lease, cancel and publication.

State lives outside the skill directory so copying or upgrading the skill never
loses jobs, user presets or per-machine verification records.
"""
from __future__ import annotations

import fcntl
import json
import os
from pathlib import Path
import secrets
import shutil
import signal
import subprocess
import sys
import threading
import time
from typing import Dict, List, Optional

TERMINAL = {"succeeded", "failed", "cancelled", "interrupted"}
ACTIVE = {"queued", "waiting_gpu", "running", "cancelling"}


def state_dir() -> Path:
    configured = os.environ.get("TVAI_STATE_DIR", "").strip()
    root = Path(configured).expanduser() if configured else Path.home() / "Library/Application Support/topaz-video-skill"
    for name in ("jobs", "presets", "inspect"):
        (root / name).mkdir(parents=True, exist_ok=True)
    return root


def write_json(path: Path, data: dict) -> None:
    temporary = path.with_name(f".{path.name}.{os.getpid()}.{secrets.token_hex(3)}.tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(str(temporary), str(path))


def read_json(path: Path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


# ---------------------------------------------------------------- verification
def verified(app_version: str) -> Dict[str, List[int]]:
    data = read_json(state_dir() / "verified.json", {}) or {}
    return {key: sorted(set(value)) for key, value in data.get(app_version, {}).items()}


def mark_verified(app_version: str, model: str, scale: int) -> None:
    path = state_dir() / "verified.json"
    with _locked(state_dir() / ".verified.lock"):
        data = read_json(path, {}) or {}
        scales = set(data.setdefault(app_version, {}).get(model, []))
        scales.add(int(scale))
        data[app_version][model] = sorted(scales)
        write_json(path, data)


class _locked:
    def __init__(self, path: Path):
        self.path = path

    def __enter__(self):
        self.handle = self.path.open("a+b")
        fcntl.flock(self.handle, fcntl.LOCK_EX)
        return self.handle

    def __exit__(self, *_exc):
        fcntl.flock(self.handle, fcntl.LOCK_UN)
        self.handle.close()


# ------------------------------------------------------------------------ jobs
def job_dir(ident: str) -> Path:
    if not ident or "/" in ident or ident.startswith("."):
        raise ValueError("無效的 job id")
    path = state_dir() / "jobs" / ident
    if not path.is_dir():
        raise ValueError(f"找不到 job {ident}")
    return path


def create(recipe: dict, runtime: dict) -> dict:
    ident = time.strftime("%Y%m%d-%H%M%S-") + secrets.token_hex(3)
    directory = state_dir() / "jobs" / ident
    directory.mkdir(parents=True)
    write_json(directory / "recipe.json", recipe)
    write_json(directory / "runtime.json", {key: runtime.get(key) for key in
                                             ("ffmpeg", "ffprobe", "model_dir", "data_dir", "app_version")})
    job = {"id": ident, "status": "queued", "kind": recipe["kind"], "preset": recipe.get("preset"),
           "model": recipe["model"], "scale": recipe["scale"] if recipe["enhancement"] else 1,
           "source": recipe["source"], "created_at": time.time(), "percent": 0,
           "stage": "排隊中", "message": "", "pid": None, "output": None, "error": None}
    write_json(directory / "job.json", job)
    return job


def _alive(pid: Optional[int]) -> bool:
    if not pid:
        return False
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


def load(ident: str) -> dict:
    directory = job_dir(ident)
    job = read_json(directory / "job.json")
    if not job:
        raise ValueError(f"job {ident} 紀錄損毀")
    if job["status"] in ACTIVE and job.get("pid") and not _alive(job["pid"]):
        job = read_json(directory / "job.json") or job  # the worker may have just finished
        if job["status"] in ACTIVE:
            job.update(status="interrupted", stage="背景程序已結束", finished_at=time.time(),
                       error="背景程序意外結束；查看 worker.log")
            write_json(directory / "job.json", job)
    return job


def update(ident: str, **fields) -> dict:
    directory = job_dir(ident)
    with _locked(directory / ".job.lock"):
        job = read_json(directory / "job.json") or {}
        job.update(fields)
        write_json(directory / "job.json", job)
    return job


def spawn(ident: str, entrypoint: Path) -> dict:
    directory = job_dir(ident)
    log = (directory / "worker.log").open("ab")
    process = subprocess.Popen([sys.executable, str(entrypoint), "_worker", ident],
                               stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT,
                               close_fds=True, start_new_session=True, cwd=str(directory))
    log.close()
    return update(ident, pid=process.pid)


def cancel(ident: str) -> dict:
    job = load(ident)
    if job["status"] in TERMINAL:
        return job
    (job_dir(ident) / "cancel").touch()
    if _alive(job.get("pid")):
        try:
            os.killpg(job["pid"], signal.SIGTERM)
        except (ProcessLookupError, PermissionError):
            pass
        return update(ident, status="cancelling", stage="正在停止")
    return update(ident, status="cancelled", stage="已停止", finished_at=time.time())


def wait(ident: str, timeout: float, interval: float = 3.0) -> dict:
    deadline = time.monotonic() + max(0.0, timeout)
    while True:
        job = load(ident)
        if job["status"] in TERMINAL or time.monotonic() >= deadline:
            return job
        time.sleep(min(interval, max(0.1, deadline - time.monotonic())))


def recent(limit: int = 10) -> List[dict]:
    root = state_dir() / "jobs"
    jobs = []
    for path in sorted(root.iterdir(), reverse=True)[:limit]:
        if path.is_dir():
            try:
                jobs.append(load(path.name))
            except ValueError:
                continue
    return jobs


# ------------------------------------------------------------------ publishing
def output_path(source: Path, label: str) -> Path:
    stem = f"{source.stem}_tvai_{label}"
    candidate = source.with_name(stem + ".mp4")
    counter = 2
    while candidate.exists() or candidate.with_name(candidate.name + ".recipe.json").exists():
        candidate = source.with_name(f"{stem}_{counter}.mp4")
        counter += 1
    return candidate


def publish(result: Path, target: Path) -> Path:
    """Hard-link when possible (same volume), otherwise copy; never overwrite."""
    try:
        os.link(str(result), str(target))
    except FileExistsError:
        raise
    except OSError:
        temporary = target.with_name(f".{target.name}.{secrets.token_hex(3)}.part")
        shutil.copyfile(str(result), str(temporary))
        if target.exists():
            temporary.unlink()
            raise FileExistsError(str(target))
        os.replace(str(temporary), str(target))
    return target


# --------------------------------------------------------------------- worker
class GpuLease:
    """One Topaz job at a time on this Mac; waiting is cancellable."""

    def __init__(self, cancelled: threading.Event, on_wait):
        self.cancelled, self.on_wait = cancelled, on_wait

    def __enter__(self):
        self.handle = (state_dir() / "gpu.lock").open("a+b")
        waiting = False
        while not self.cancelled.is_set():
            try:
                fcntl.flock(self.handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return self
            except BlockingIOError:
                if not waiting:
                    self.on_wait()
                    waiting = True
                self.cancelled.wait(1)
        return self

    def __exit__(self, *_exc):
        try:
            fcntl.flock(self.handle, fcntl.LOCK_UN)
        finally:
            self.handle.close()
