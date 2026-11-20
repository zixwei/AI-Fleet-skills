#!/usr/bin/env python3
"""tvai — agent-facing CLI for local Topaz Video enhancement (JSON in, JSON out).

Commands: doctor | presets | inspect | plan | run | export | status | wait |
cancel | compare | jobs | prune | save-preset | selftest. See SKILL.md for the flow.
Every command prints exactly one JSON object; exit code 0 = ok, 1 = refused/failed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tvai_core import __version__, jobs, media, presets as preset_lib  # noqa: E402
from tvai_core.catalog import BY_ID, PARAMETERS  # noqa: E402
from tvai_core.contracts import normalize_recipe, validate_capabilities  # noqa: E402
from tvai_core.discovery import discover, inventory  # noqa: E402
from tvai_core.pipeline import output_timing  # noqa: E402
from tvai_core.runner import RunError, execute  # noqa: E402

ENTRY = Path(__file__).resolve()


class Refused(Exception):
    pass


def emit(payload: dict, ok: bool = True) -> int:
    payload = {"ok": ok, **payload}
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if ok else 1


def machine() -> tuple:
    report = discover()
    stock = inventory(report)
    return report, stock, jobs.verified(report.get("app_version", ""))


def require_ready(report: dict) -> None:
    if report["problems"]:
        raise Refused("；".join(report["problems"]))


# --------------------------------------------------------------------- doctor
def cmd_doctor(_args) -> int:
    report, stock, verified = machine()
    models = [{**entry, "verified_scales": verified.get(key, [])} for key, entry in stock["models"].items()]
    version_note = ""
    if report["app_version"] and report["app_version"] != report["reference_app_version"]:
        version_note = (f"App 版本 {report['app_version']} 與移植基準 {report['reference_app_version']} 不同；"
                        "第一次使用前請執行 selftest")
    elif report["app_version"] and not verified:
        version_note = "這台機器尚未通過 selftest；第一次使用前請執行 selftest"
    return emit({
        "skill_version": __version__, "ready": not report["problems"] and any(m["available"] for m in models),
        "app": report["app"], "app_version": report["app_version"], "licensed": report["licensed"],
        "model_data_dir": report["data_dir"], "problems": report["problems"], "note": version_note,
        "models": models, "filters": stock["filters"],
        "unsupported_in_this_skill": ["Starlight Precise / Mini", "Hyperion 2 HDR"],
        "state_dir": str(jobs.state_dir()),
    })


# -------------------------------------------------------------------- presets
def cmd_presets(_args) -> int:
    report, stock, verified = machine()
    builtin = preset_lib.load_builtin()
    items = [preset_lib.describe(item, stock, verified)
             for item in preset_lib.all_presets(jobs.state_dir() / "presets")]
    categories = builtin["categories"] + ([{"id": "mine", "label": "我的預設", "description": "save-preset 存下的配方"}]
                                          if any(item["user"] for item in items) else [])
    return emit({"categories": categories, "presets": items,
                 "parameters": [{k: v for k, v in item.items() if k != "integer"} for item in PARAMETERS.values()],
                 "problems": report["problems"]})


# -------------------------------------------------------------------- inspect
def cmd_inspect(args) -> int:
    report, _stock, _verified = machine()
    if not report["ffprobe"]:
        raise Refused("；".join(report["problems"]))
    video = Path(args.video).expanduser().resolve()
    if not video.is_file():
        raise Refused(f"找不到影片：{video}")
    info = media.probe(Path(report["ffprobe"]), video)
    digest = hashlib.sha1(f"{video}:{video.stat().st_mtime_ns}".encode()).hexdigest()[:12]
    frames = media.extract_frames(Path(report["ffmpeg"]), video, info,
                                  jobs.state_dir() / "inspect" / digest, count=args.frames)
    short = min(info["width"], info["height"])
    return emit({"source": str(video), "media": info, "frames": frames,
                 "hints": {"short_side": short,
                           "orientation": "portrait" if info["height"] > info["width"] else "landscape",
                           "max_scale_within_8192": max([s for s in (1, 2, 4)
                                                         if info["width"] * s <= 8192 and info["height"] * s <= 8192] or [0])},
                 "next": "看過 frames 後選擇預設，再執行 plan"})


# ----------------------------------------------------------------------- plan
def _add_recipe_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("video", nargs="?", help="原片路徑（使用 --from-job 時可省略）")
    parser.add_argument("--preset")
    parser.add_argument("--model", choices=sorted(BY_ID))
    parser.add_argument("--scale", type=int)
    parser.add_argument("--set", action="append", default=[], metavar="KEY=V|KEY+=D|KEY-=D")
    parser.add_argument("--add", action="append", default=[], metavar="FILTER[:k=v,...]")
    parser.add_argument("--remove", action="append", default=[], metavar="FILTER")
    parser.add_argument("--encode", choices=("h264", "hevc", "hevc10"))
    parser.add_argument("--audio", choices=("aac", "mute"))
    parser.add_argument("--bitrate", type=float, help="Mbps；0 交給編碼器決定")
    parser.add_argument("--kind", choices=("preview", "export"), default="preview")
    parser.add_argument("--at", type=float, default=None, help="選區起點（秒）")
    parser.add_argument("--seconds", type=float, default=None, help="選區長度（秒）；export 預設 0 = 到片尾")
    parser.add_argument("--from-job", help="以既有 job 的配方為基礎再覆寫")


def _build(args) -> tuple:
    report, stock, verified = machine()
    require_ready(report)
    base = None
    if args.from_job:
        base = jobs.read_json(jobs.job_dir(args.from_job) / "recipe.json")
        if not base:
            raise Refused(f"job {args.from_job} 沒有配方")
    source = str(Path(args.video).expanduser().resolve()) if args.video else (base or {}).get("source")
    if not source:
        raise Refused("請提供原片路徑或 --from-job")
    if not Path(source).is_file():
        raise Refused(f"找不到影片：{source}")
    preset = preset_lib.find(jobs.state_dir() / "presets", args.preset) if args.preset else None
    if base and args.kind == "export" and args.at is None:
        start, seconds = 0.0, args.seconds if args.seconds is not None else 0.0
    else:
        start = args.at if args.at is not None else (base or {}).get("start_seconds", 0.0) if args.kind == "preview" else 0.0
        seconds = args.seconds
        if seconds is None and base and args.kind == "preview":
            seconds = base.get("max_seconds")
    raw, warnings = preset_lib.build_recipe(
        source=source, preset=preset, inventory=stock, verified=verified, model=args.model, scale=args.scale,
        sets=args.set, adds=args.add, removes=args.remove, codec=args.encode, audio=args.audio,
        bitrate=args.bitrate, kind=args.kind, start=float(start or 0), seconds=seconds, base=base)
    recipe = normalize_recipe(raw)
    validate_capabilities(recipe, stock)
    info = media.probe(Path(report["ffprobe"]), Path(recipe["source"]), count_frames=False)
    scale = recipe["scale"] if recipe["enhancement"] else 1
    width, height = info["width"] * scale, info["height"] * scale
    if width > 8192 or height > 8192:
        raise Refused(f"輸出 {width}×{height} 超過 8192 像素上限；請改用較小倍率")
    if recipe["start_seconds"] >= info["duration"]:
        raise Refused(f"選區起點 {recipe['start_seconds']:g}s 超出影片長度 {info['duration']:.2f}s")
    remaining = info["duration"] - recipe["start_seconds"]
    span = min(remaining, recipe["max_seconds"]) if recipe["max_seconds"] else remaining
    frames = max(1, round(span * info["fps"]))
    out_frames, out_fps, slowmo = output_timing(recipe, info["fps"], frames)
    if frames < 4:
        raise Refused("選區至少要 4 幀")
    summary = {"model": BY_ID[recipe["model"]].label if recipe["enhancement"] else "（不增強，只套濾鏡）",
               "scale": scale, "verified_on_this_mac": scale in verified.get(recipe["model"], []),
               "input": f"{info['width']}×{info['height']} @ {info['fps']:g}fps",
               "output": f"{width}×{height} @ {out_fps:g}fps", "clip_seconds": round(span, 3),
               "output_seconds": round(span * slowmo, 3), "frames": frames,
               "filters": list(recipe["filters"]), "encoding": recipe["encoding"]}
    if not summary["verified_on_this_mac"] and recipe["enhancement"]:
        warnings.append("這個模型 / 倍率尚未在本機驗證；建議先跑短預覽")
    return recipe, summary, warnings, report


def cmd_plan(args) -> int:
    recipe, summary, warnings, _report = _build(args)
    return emit({"recipe": recipe, "summary": summary, "warnings": warnings,
                 "next": "確認後用相同參數執行 run（或 export）"})


def _start(recipe: dict, report: dict) -> dict:
    job = jobs.create(recipe, report)
    return jobs.spawn(job["id"], ENTRY)


def cmd_run(args) -> int:
    if args.recipe:
        report, stock, _verified = machine()
        require_ready(report)
        recipe = normalize_recipe(jobs.read_json(Path(args.recipe).expanduser()) or {})
        validate_capabilities(recipe, stock)
        summary, warnings = {}, []
    else:
        recipe, summary, warnings, report = _build(args)
    if recipe["kind"] == "export" and not args.confirmed:
        raise Refused("全片匯出需要使用者明確確認；確認後加上 --confirmed 再執行")
    job = _start(recipe, report)
    return emit({"job": job, "summary": summary, "warnings": warnings,
                 "next": f"用 `wait {job['id']}` 追蹤進度（每次最多等 540 秒）"})


def cmd_export(args) -> int:
    args.kind = "export"
    return cmd_run(args)


# ------------------------------------------------------------ status / wait
def _decorate(job: dict) -> dict:
    if job["status"] == "succeeded" and job["kind"] == "preview":
        job.setdefault("next", "執行 compare 產生對照圖，給使用者確認後再 export --from-job")
    return job


def cmd_status(args) -> int:
    if not args.job:
        return emit({"jobs": jobs.recent(args.limit)})
    return emit({"job": _decorate(jobs.load(args.job))})


def cmd_wait(args) -> int:
    job = jobs.wait(args.job, min(args.timeout, 540))
    return emit({"job": _decorate(job), "finished": job["status"] in jobs.TERMINAL},
                ok=job["status"] not in ("failed", "interrupted"))


def cmd_cancel(args) -> int:
    return emit({"job": jobs.cancel(args.job)})


# -------------------------------------------------------------------- compare
def cmd_compare(args) -> int:
    job = jobs.load(args.job)
    if job["status"] != "succeeded":
        raise Refused("只有成功的 job 才能產生對照圖")
    directory = jobs.job_dir(args.job)
    runtime = jobs.read_json(directory / "runtime.json") or {}
    provenance = jobs.read_json(directory / "result/provenance.json") or {}
    result = Path(job["output"])
    if not result.is_file():
        raise Refused(f"結果檔已不存在：{result}")
    info = provenance["media"]
    duration = float(info["duration"])
    points = [duration * fraction for fraction in ((0.5,) if args.count == 1 else (0.2, 0.5, 0.8))][:args.count]
    images = []
    for index, result_at in enumerate(points):
        result_at = min(result_at, duration - 1 / float(info["fps"]))
        source_at = provenance["clip_start_seconds"] + result_at / float(provenance.get("time_scale", 1))
        images.append(media.compare_frame(Path(runtime["ffmpeg"]), Path(job["source"]), source_at, result,
                                          result_at, info, directory / f"compare-{index + 1}.png", crop=args.crop))
    return emit({"job_id": args.job, "images": images,
                 "note": "請檢視圖片後再向使用者描述差異；畫質判斷以實際畫面為準"})


# ---------------------------------------------------------------------- prune
def cmd_prune(args) -> int:
    removed, kept = [], 0
    cutoff = time.time() - args.days * 86400
    for job in jobs.recent(10 ** 6):
        if job["status"] in jobs.TERMINAL and job.get("finished_at", job["created_at"]) < cutoff:
            removed.append(job["id"])
            if not args.dry_run:
                shutil.rmtree(str(jobs.job_dir(job["id"])))
        else:
            kept += 1
    return emit({"removed": removed, "kept": kept, "dry_run": args.dry_run,
                 "note": "只刪除 job 目錄（預覽結果、日誌）；已匯出到原片旁的檔案不受影響"})


# ------------------------------------------------------------------ save-preset
def cmd_save_preset(args) -> int:
    if not preset_lib.NAME.match(args.name):
        raise Refused("預設名稱只能用小寫英數與連字號，最長 40 字元")
    builtin_ids = {item["id"] for item in preset_lib.load_builtin()["presets"]}
    if args.name in builtin_ids:
        raise Refused("不能覆蓋內建預設")
    recipe = jobs.read_json(jobs.job_dir(args.from_job) / "recipe.json")
    if not recipe:
        raise Refused("找不到 job 配方")
    defaults = {key: item["default"] for key, item in PARAMETERS.items()}
    preset = {"id": args.name, "label": args.label or args.name, "detail": args.detail or "",
              "choices": [[recipe["model"], recipe["scale"]]],
              "params": {k: v for k, v in recipe["params"].items() if v != defaults[k]},
              "filters": recipe["filters"], "encoding": recipe["encoding"], "source_job": args.from_job}
    target = jobs.state_dir() / "presets" / f"{args.name}.json"
    if target.exists() and not args.replace:
        raise Refused(f"預設 {args.name} 已存在；要覆蓋請加 --replace")
    jobs.write_json(target, preset)
    return emit({"preset": preset, "path": str(target)})


# ------------------------------------------------------------------- selftest
def cmd_selftest(args) -> int:
    report, stock, _verified = machine()
    require_ready(report)
    targets = []
    for model_id, entry in stock["models"].items():
        if not entry["available"] or (args.model and model_id != args.model):
            continue
        for scale in BY_ID[model_id].scales if args.all or args.model else BY_ID[model_id].scales[:1]:
            targets.append((model_id, scale))
        if not args.all and not args.model:
            break
    if not targets:
        raise Refused("沒有可測試的模型；先看 doctor 的 models[].reason")
    workdir = jobs.state_dir() / "selftest"
    workdir.mkdir(exist_ok=True)
    source = workdir / f"synthetic-{args.width}x{args.height}.mp4"
    if not source.exists():
        made = subprocess.run([report["ffmpeg"], "-hide_banner", "-nostdin", "-y", "-loglevel", "error",
                               "-f", "lavfi", "-i", f"testsrc2=size={args.width}x{args.height}:rate=24:duration=0.5",
                               "-c:v", "h264_videotoolbox", "-pix_fmt", "yuv420p", str(source)],
                              capture_output=True, text=True, timeout=120)
        if made.returncode:
            raise Refused("無法產生測試影片：" + made.stderr[-300:])
    results = []
    cancelled = threading.Event()
    signal.signal(signal.SIGTERM, lambda *_: cancelled.set())
    with jobs.GpuLease(cancelled, lambda: None):
        for model_id, scale in targets:
            recipe = normalize_recipe({"source": str(source), "kind": "preview", "max_seconds": 0.5,
                                       "model": model_id, "scale": scale, "encoding": {"audio": "mute"}})
            began = time.monotonic()
            with tempfile.TemporaryDirectory(dir=str(workdir)) as scratch:
                try:
                    outcome = execute(recipe, report, Path(scratch), cancelled, lambda _p: None)
                    jobs.mark_verified(report["app_version"], model_id, scale)
                    results.append({"model": model_id, "scale": scale, "ok": True,
                                    "seconds": round(time.monotonic() - began, 1),
                                    "output": f"{outcome['provenance']['media']['width']}×{outcome['provenance']['media']['height']}"})
                except RunError as exc:
                    results.append({"model": model_id, "scale": scale, "ok": False, "error": str(exc)})
    passed = all(item["ok"] for item in results)
    return emit({"app_version": report["app_version"], "results": results,
                 "verified": jobs.verified(report["app_version"]),
                 "meaning": "通過代表授權 checkout 成功、無浮水印、輸出幀數與尺寸正確；不代表長片畫質或速度"}, ok=passed)


# --------------------------------------------------------------------- worker
def cmd_worker(args) -> int:
    ident = args.job
    directory = jobs.job_dir(ident)
    cancelled = threading.Event()
    signal.signal(signal.SIGTERM, lambda *_: cancelled.set())
    if (directory / "cancel").exists():
        cancelled.set()
    recipe = jobs.read_json(directory / "recipe.json")
    runtime = jobs.read_json(directory / "runtime.json")

    def progress(info: dict) -> None:
        if not cancelled.is_set():
            jobs.update(ident, status="running", percent=int(info.get("percent", 0)),
                        stage=str(info.get("stage", ""))[:80], message=str(info.get("message", ""))[:200])

    try:
        with jobs.GpuLease(cancelled, lambda: jobs.update(ident, status="waiting_gpu", stage="等待其他 Topaz 任務結束")):
            if cancelled.is_set():
                raise RunError("已取消")
            jobs.update(ident, status="running", stage="準備模型", started_at=time.time())
            outcome = execute(recipe, runtime, directory, cancelled, progress)
        provenance = outcome["provenance"]
        fields = {"status": "succeeded", "percent": 100, "stage": "完成", "finished_at": time.time(),
                  "media": provenance["media"], "elapsed_seconds": provenance["elapsed_seconds"]}
        if provenance["enhancement_ran"]:
            jobs.mark_verified(runtime.get("app_version", ""), recipe["model"], recipe["scale"])
        if recipe["kind"] == "export":
            label = recipe.get("preset") or recipe["model"]
            target = jobs.publish(Path(outcome["path"]), jobs.output_path(Path(recipe["source"]), label))
            jobs.write_json(target.with_name(target.name + ".recipe.json"),
                            {"recipe": recipe, "job_id": ident, "app_version": runtime.get("app_version"),
                             "provenance": provenance})
            fields["output"] = str(target)
            Path(outcome["path"]).unlink()  # the published file is the only copy kept
        else:
            fields["output"] = outcome["path"]
            total = outcome["source"]["frames"]
            per_frame = provenance["elapsed_seconds"] / max(1, provenance["source_frames"])
            fields["estimate_export_seconds"] = round(per_frame * total)
            fields["estimate_note"] = "依預覽速度線性推算整支影片；首次載入模型的時間會讓預估偏高"
        jobs.update(ident, **fields)
        return 0
    except RunError as exc:
        if cancelled.is_set():
            jobs.update(ident, status="cancelled", stage="已停止", finished_at=time.time())
        else:
            jobs.update(ident, status="failed", stage="失敗", error=str(exc)[:2000], finished_at=time.time())
        return 1
    except Exception as exc:  # keep the record truthful even on bugs
        jobs.update(ident, status="failed", stage="失敗", error=f"{type(exc).__name__}: {exc}"[:2000],
                    finished_at=time.time())
        raise


# ----------------------------------------------------------------------- main
def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="tvai.py", description=__doc__)
    sub = root.add_subparsers(dest="command", required=True)
    sub.add_parser("doctor").set_defaults(func=cmd_doctor)
    sub.add_parser("presets").set_defaults(func=cmd_presets)
    p = sub.add_parser("inspect")
    p.add_argument("video")
    p.add_argument("--frames", type=int, default=3, choices=(1, 3, 5))
    p.set_defaults(func=cmd_inspect)
    for name, func in (("plan", cmd_plan), ("run", cmd_run), ("export", cmd_export)):
        p = sub.add_parser(name)
        _add_recipe_arguments(p)
        if name != "plan":
            p.add_argument("--recipe", help="直接使用配方 JSON 檔")
            p.add_argument("--confirmed", action="store_true", help="使用者已明確確認全片匯出")
        p.set_defaults(func=func)
    p = sub.add_parser("status")
    p.add_argument("job", nargs="?")
    p.add_argument("--limit", type=int, default=10)
    p.set_defaults(func=cmd_status)
    sub.add_parser("jobs").set_defaults(func=cmd_status, job=None, limit=20)
    p = sub.add_parser("wait")
    p.add_argument("job")
    p.add_argument("--timeout", type=float, default=540)
    p.set_defaults(func=cmd_wait)
    p = sub.add_parser("cancel")
    p.add_argument("job")
    p.set_defaults(func=cmd_cancel)
    p = sub.add_parser("compare")
    p.add_argument("job")
    p.add_argument("--count", type=int, default=1, choices=(1, 3))
    p.add_argument("--crop", type=int, default=720)
    p.set_defaults(func=cmd_compare)
    p = sub.add_parser("save-preset")
    p.add_argument("name")
    p.add_argument("--from-job", required=True)
    p.add_argument("--label")
    p.add_argument("--detail")
    p.add_argument("--replace", action="store_true")
    p.set_defaults(func=cmd_save_preset)
    p = sub.add_parser("selftest")
    p.add_argument("--all", action="store_true", help="測試所有可用模型與倍率（較久）")
    p.add_argument("--model", choices=sorted(BY_ID))
    p.add_argument("--width", type=int, default=320)
    p.add_argument("--height", type=int, default=256)
    p.set_defaults(func=cmd_selftest)
    p = sub.add_parser("prune")
    p.add_argument("--days", type=float, default=7)
    p.add_argument("--dry-run", action="store_true")
    p.set_defaults(func=cmd_prune)
    p = sub.add_parser("_worker")
    p.add_argument("job")
    p.set_defaults(func=cmd_worker)
    return root


def main(argv=None) -> int:
    args = parser().parse_args(argv)
    if args.command == "_worker":
        return args.func(args)
    try:
        return args.func(args)
    except (Refused, ValueError, media.MediaError, RunError, FileExistsError) as exc:
        return emit({"error": str(exc), "command": args.command}, ok=False)


if __name__ == "__main__":
    sys.exit(main())
