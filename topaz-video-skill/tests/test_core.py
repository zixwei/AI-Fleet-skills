"""Portable tests: no Topaz install, GPU or network needed (stdlib unittest)."""
from __future__ import annotations

import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from tvai_core import jobs, presets  # noqa: E402
from tvai_core.catalog import BY_ID, PARAMETERS  # noqa: E402
from tvai_core.contracts import normalize_recipe, to_spec, validate_capabilities  # noqa: E402
from tvai_core.pipeline import (advanced_passes, audio_filter, audio_mux_command,  # noqa: E402
                                conventional_pass, enhancement_filter, output_timing)

SOURCE = "/videos/in.mp4"
FFMPEG = Path("/App/Contents/MacOS/ffmpeg")


def recipe(**overrides):
    base = {"source": SOURCE, "model": "rhea", "scale": 2, "kind": "preview", "max_seconds": 3}
    base.update(overrides)
    return normalize_recipe(base)


def stock(models=None, filters=None):
    models = models or {key: True for key in BY_ID}
    entry = lambda key, ok: {"id": key, "label": BY_ID[key].label, "available": ok, "reason": "" if ok else "缺少權重"}
    filters = filters or {}
    return {"models": {key: entry(key, models.get(key, False)) for key in BY_ID},
            "filters": {"denoise": {"available": filters.get("denoise", True), "reason": "x"},
                        "interpolation": {"available": filters.get("interpolation", False), "reason": "請下載補幀",
                                          "models": [{"id": "chf-3", "available": filters.get("interpolation", False)}]},
                        "motion_deblur": {"available": False, "reason": "請下載 Themis", "models": []},
                        "stabilization": {"available": True, "full_frame": False, "jitter": False, "reason": ""}}}


class ContractTests(unittest.TestCase):
    def test_defaults_and_flatten(self):
        item = recipe()
        self.assertEqual(item["encoding"], {"codec": "h264", "bitrate_mbps": 0, "audio": "aac"})
        self.assertEqual(item["params"]["gsize"], 0)
        spec = to_spec(item)
        self.assertEqual((spec["task_kind"], spec["details"], spec["scale"]), ("preview", 0.0, 2))

    def test_rejections(self):
        cases = [
            ({"model": "precise-26"}, "未知模型"),
            ({"model": "iris", "scale": 2}, "不支援 2×"),
            ({"params": {"details": 1.2}}, "params.details"),
            ({"params": {"gsize": 2.5}}, "整數"),
            ({"params": {"bogus": 1}}, "不支援的參數"),
            ({"kind": "preview", "max_seconds": 0}, "預覽必須"),
            ({"source": "relative.mp4"}, "絕對路徑"),
            ({"filters": {"hdr": {}}}, "不支援的參數"),
            ({"encoding": {"codec": "prores"}}, "encoding.codec"),
            ({"enhancement": False, "scale": 1, "filters": {}}, "至少要啟用一個濾鏡"),
            ({"extra": 1}, "未知欄位"),
        ]
        for overrides, message in cases:
            with self.subTest(overrides=overrides):
                with self.assertRaises(ValueError) as caught:
                    recipe(**overrides)
                self.assertIn(message, str(caught.exception))

    def test_filter_only_requires_scale_one(self):
        item = recipe(enhancement=False, scale=1, filters={"denoise": {}})
        self.assertEqual(item["scale"], 1)
        with self.assertRaises(ValueError):
            recipe(enhancement=False, scale=2, filters={"denoise": {}})

    def test_capabilities(self):
        validate_capabilities(recipe(), stock())
        with self.assertRaisesRegex(ValueError, "缺少權重"):
            validate_capabilities(recipe(), stock(models={"proteus-v4": True}))
        with self.assertRaisesRegex(ValueError, "補幀"):
            validate_capabilities(recipe(filters={"interpolation": {}}), stock())
        with self.assertRaisesRegex(ValueError, "Refine"):
            validate_capabilities(recipe(filters={"stabilization": {"mode": "full_frame"}}), stock())


class PipelineGoldenTests(unittest.TestCase):
    """Exact command shapes ported from CanvasHub; change only on purpose."""

    def test_enhancement_filter(self):
        spec = to_spec(recipe(params={"details": 0.15, "gsize": 2}))
        self.assertEqual(
            enhancement_filter(spec, 2560, 1440),
            "tvai_up=model=rhea-1:scale=0:w=2560:h=1440:device=0:instances=0:download=0:"
            "preblur=0:noise=0:details=0.15:halo=0:blur=0:compression=0:prenoise=0:blend=0:grain=0:gsize=2")

    def test_conventional_preroll_and_output_seek(self):
        spec = {**to_spec(recipe(start_seconds=7.5)), "start_seconds": 7.5, "max_seconds": 2.0}
        command = conventional_pass(FFMPEG, spec, Path(SOURCE), Path("/w/out.mp4"), 2560, 1440, 48).command
        self.assertEqual(command[:7], [str(FFMPEG), "-hide_banner", "-nostdin", "-y", "-nostats", "-progress", "pipe:1"])
        self.assertEqual(command[7:13], ["-ss", "5.50000000", "-i", SOURCE, "-ss", "2.00000000"])
        self.assertEqual(command[13:17], ["-t", "2.00000000", "-frames:v", "48"])
        self.assertIn("download=0", command[command.index("-filter_complex") + 1])
        self.assertEqual(command[-4:], ["-movflags", "+faststart", "-an", "/w/out.mp4"])

    def test_conventional_near_start_has_no_coarse_seek(self):
        spec = {**to_spec(recipe(start_seconds=1)), "start_seconds": 1.0, "max_seconds": 1.0}
        command = conventional_pass(FFMPEG, spec, Path(SOURCE), Path("/o.mp4"), 2, 2, 24).command
        self.assertEqual(command[7:11], ["-i", SOURCE, "-ss", "1.00000000"])

    def test_hevc_encoding(self):
        spec = {**to_spec(recipe(encoding={"codec": "hevc10", "bitrate_mbps": 40})), "max_seconds": 1}
        command = conventional_pass(FFMPEG, spec, Path(SOURCE), Path("/o.mp4"), 2, 2, 24).command
        joined = " ".join(command)
        self.assertIn("-c:v hevc_videotoolbox -pix_fmt p010le -allow_sw 1 -tag:v hvc1 -b:v 40M", joined)

    def test_advanced_plan(self):
        item = recipe(filters={"stabilization": {}, "denoise": {"noise": 0.3}, "interpolation": {"fps": 60, "slowmo": 2}})
        spec = {**to_spec(item), "start_seconds": 1.0, "max_seconds": 2.0}
        passes = advanced_passes(FFMPEG, Path("/w"), spec, Path(SOURCE), Path("/w/out.mp4"),
                                 width=2560, height=1440, frames=48, fps=24.0)
        self.assertEqual([p.licensed for p in passes], [False, True, True, True])
        chain = passes[2].command[passes[2].command.index("-vf") + 1].split(",")
        self.assertTrue(chain[0].startswith("tvai_stb=model=ref-2:filename=cpe.json"))
        self.assertTrue(chain[1].startswith("tvai_up=model=nyx-3:scale=1:noise=0.3"))
        self.assertTrue(chain[2].startswith("tvai_up=model=rhea-1:scale=0:w=2560:h=1440"))
        self.assertEqual(chain[3], "scale=2560:1440")
        tail = passes[3].command
        self.assertEqual(tail[tail.index("-vf") + 1],
                         "tpad=stop_mode=clone:stop_duration=0.04166667,"
                         "tvai_fi=model=chf-3:fps=60:slowmo=2:rdt=0.01:device=0:instances=0:download=0")
        self.assertEqual(tail[tail.index("-frames:v") + 1], "240")

    def test_timing_and_audio(self):
        self.assertEqual(output_timing({"filters": {"interpolation": {"fps": 60, "slowmo": 2}}}, 24.0, 48), (240, 60.0, 2.0))
        self.assertEqual(output_timing({"filters": {}}, 30.0, 90), (90, 30.0, 1.0))
        self.assertEqual(audio_filter(1), "apad")
        self.assertEqual(audio_filter(4), "atempo=0.5,atempo=0.5,apad")
        self.assertEqual(audio_filter(3), "atempo=0.5,atempo=0.666667,apad")
        mux = audio_mux_command(FFMPEG, Path("/r.mp4"), Path(SOURCE), Path("/f.mp4"), start_seconds=1, duration_seconds=2)
        self.assertEqual(mux[mux.index("-af") + 1], "apad")
        self.assertIn("-shortest", mux)


class PresetTests(unittest.TestCase):
    def setUp(self):
        self.builtin = {item["id"]: item for item in presets.load_builtin()["presets"]}

    def test_builtin_shape(self):
        data = presets.load_builtin()
        categories = {item["id"] for item in data["categories"]}
        self.assertLessEqual(len(categories), 3, "Codex request_user_input allows at most 3 options")
        for item in data["presets"]:
            self.assertIn(item["category"], categories)
            for model, scale in item["choices"]:
                self.assertIn(scale, BY_ID[model].scales, item["id"])
        per_category = {}
        for item in data["presets"]:
            per_category.setdefault(item["category"], []).append(item["id"])
        self.assertTrue(all(len(ids) <= 3 for ids in per_category.values()), per_category)

    def test_resolve_falls_back_in_order(self):
        preset = self.builtin["enhance-2x"]
        self.assertEqual(presets.resolve(preset, stock(), {})["model"], "artemis")
        fallback = presets.resolve(preset, stock(models={"theia-v4": True}), {"theia-v4": [2]})
        self.assertEqual((fallback["model"], fallback["scale"], fallback["verified"]), ("theia-v4", 2, True))
        self.assertIsNone(presets.resolve(preset, stock(models={"iris": True}), {}))

    def build(self, **kwargs):
        defaults = dict(source=SOURCE, preset=self.builtin["general"], inventory=stock(), verified={}, model=None,
                        scale=None, sets=[], adds=[], removes=[], codec=None, audio=None, bitrate=None,
                        kind="preview", start=0.0, seconds=None)
        defaults.update(kwargs)
        return presets.build_recipe(**defaults)

    def test_overrides(self):
        raw, warnings = self.build(sets=["details=0.2", "details+=0.15", "noise-=0.5"],
                                   adds=["interp:60", "denoise:noise=0.3"], codec="hevc")
        item = normalize_recipe(raw)
        self.assertAlmostEqual(item["params"]["details"], 0.35)
        self.assertEqual(item["params"]["noise"], 0)
        self.assertTrue(warnings)
        self.assertEqual(item["filters"]["interpolation"]["fps"], 60)
        self.assertEqual(item["filters"]["denoise"]["noise"], 0.3)
        self.assertEqual((item["encoding"]["codec"], item["max_seconds"], item["preset"]), ("hevc", 3, "general"))

    def test_model_override_drops_incompatible_scale(self):
        raw, _ = self.build(preset=self.builtin["enhance-4x"], model="iris")
        self.assertEqual(normalize_recipe(raw)["scale"], 1)

    def test_from_base_recipe_to_export(self):
        base = normalize_recipe({"source": SOURCE, "model": "rhea", "scale": 4, "kind": "preview",
                                 "start_seconds": 6, "max_seconds": 2, "params": {"details": 0.2}})
        raw, _ = self.build(preset=None, base=base, kind="export", start=0.0, seconds=0.0)
        item = normalize_recipe(raw)
        self.assertEqual((item["model"], item["scale"], item["kind"], item["max_seconds"]), ("rhea", 4, "export", 0.0))
        self.assertEqual(item["params"]["details"], 0.2)

    def test_set_syntax_errors(self):
        for bad in (["details"], ["details=+"], ["details+=x"], ["unknown=1"]):
            with self.subTest(bad=bad):
                with self.assertRaises(ValueError):
                    self.build(sets=bad) if bad != ["details=+"] else normalize_recipe(self.build(sets=bad)[0])

    def test_unknown_filter(self):
        with self.assertRaisesRegex(ValueError, "未知濾鏡"):
            self.build(adds=["hdr"])


class JobStateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        os.environ["TVAI_STATE_DIR"] = self.temp.name

    def tearDown(self):
        os.environ.pop("TVAI_STATE_DIR", None)
        self.temp.cleanup()

    def test_output_path_never_overwrites(self):
        source = Path(self.temp.name) / "clip.mov"
        source.write_bytes(b"x")
        first = jobs.output_path(source, "enhance-2x")
        self.assertEqual(first.name, "clip_tvai_enhance-2x.mp4")
        first.write_bytes(b"y")
        self.assertEqual(jobs.output_path(source, "enhance-2x").name, "clip_tvai_enhance-2x_2.mp4")

    def test_publish_refuses_existing(self):
        result = Path(self.temp.name) / "r.mp4"
        result.write_bytes(b"r")
        target = Path(self.temp.name) / "t.mp4"
        jobs.publish(result, target)
        with self.assertRaises(FileExistsError):
            jobs.publish(result, target)

    def test_job_lifecycle_without_worker(self):
        item = recipe()
        job = jobs.create(item, {"ffmpeg": "/x", "ffprobe": "/y", "model_dir": "/m", "data_dir": "/d", "app_version": "1"})
        self.assertEqual(jobs.load(job["id"])["status"], "queued")
        self.assertEqual(jobs.cancel(job["id"])["status"], "cancelled")
        self.assertTrue((jobs.job_dir(job["id"]) / "cancel").exists())
        jobs.update(job["id"], status="running", pid=999999)
        self.assertEqual(jobs.load(job["id"])["status"], "interrupted")

    def test_verified_is_per_app_version(self):
        jobs.mark_verified("1.7.1", "rhea", 4)
        jobs.mark_verified("1.7.1", "rhea", 2)
        self.assertEqual(jobs.verified("1.7.1"), {"rhea": [2, 4]})
        self.assertEqual(jobs.verified("1.8.0"), {})

    def test_job_dir_rejects_traversal(self):
        for bad in ("", "../x", ".hidden", "a/b"):
            with self.assertRaises(ValueError):
                jobs.job_dir(bad)


class ParameterTableTests(unittest.TestCase):
    def test_gsize_is_integer(self):
        self.assertTrue(PARAMETERS["gsize"].get("integer"))
        self.assertEqual(json.loads(json.dumps(PARAMETERS["details"]))["max"], 1)


if __name__ == "__main__":
    unittest.main()
