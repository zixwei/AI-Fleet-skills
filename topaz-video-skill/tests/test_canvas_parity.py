"""Drift check against CanvasHub's Topaz Video planner (optional).

Runs only when CANVASHUB_ROOT points at a CanvasHub checkout. It compares the
exact FFmpeg argument vectors both projects build for the same spec, so a fix
landed on one side shows up as a failure here instead of silently diverging.
Labels differ on purpose (zh-Hans vs zh-Hant) and are not compared.
"""
from __future__ import annotations

import os
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
CANVAS = os.environ.get("CANVASHUB_ROOT", "").strip()

from tvai_core.contracts import normalize_recipe, to_spec  # noqa: E402
from tvai_core import pipeline as ours  # noqa: E402


@unittest.skipUnless(CANVAS and (Path(CANVAS) / "backend/topaz_video/pipeline.py").is_file(),
                     "set CANVASHUB_ROOT to a CanvasHub checkout to run the drift check")
class CanvasParityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        sys.path.insert(0, CANVAS)
        from backend.topaz_video import pipeline as canvas_pipeline, runtime as canvas_runtime
        cls.canvas_pipeline, cls.canvas_runtime = canvas_pipeline, canvas_runtime
        cls.root = Path("/stage")
        cls.ffmpeg = cls.root / "conventional/Contents/MacOS/ffmpeg"

    def spec(self, **overrides):
        base = {"source": "/in.mp4", "model": "rhea", "scale": 2, "kind": "export", "max_seconds": 2,
                "start_seconds": 7.5, "params": {"details": 0.15, "grain": 0.1, "gsize": 2}}
        base.update(overrides)
        return to_spec(normalize_recipe(base))

    def test_single_pass_command(self):
        spec = self.spec()
        mine = ours.conventional_pass(self.ffmpeg, spec, Path("/in.mp4"), Path("/o.mp4"), 2560, 1440, 48).command
        theirs = self.canvas_runtime.build_conventional_command(self.ffmpeg, spec, Path("/in.mp4"), Path("/o.mp4"),
                                                                2560, 1440, 48)
        self.assertEqual(mine, theirs)

    def test_advanced_plan_commands(self):
        spec = self.spec(filters={"stabilization": {"strength": 8}, "denoise": {"noise": 0.3},
                                  "interpolation": {"fps": 60, "slowmo": 2}},
                         encoding={"codec": "hevc", "bitrate_mbps": 0, "audio": "aac"})
        mine = ours.advanced_passes(self.ffmpeg, Path("/w"), spec, Path("/in.mp4"), Path("/o.mp4"),
                                    width=2560, height=1440, frames=48, fps=24.0)
        theirs = self.canvas_pipeline.build_plan(self.root, Path("/w"), spec, Path("/in.mp4"), Path("/o.mp4"),
                                                 width=2560, height=1440, frames=48, fps=24.0).passes
        self.assertEqual([p.command for p in mine], [p.command for p in theirs])
        self.assertEqual([p.licensed for p in mine], [p.engine == "licensed" for p in theirs])

    def test_audio_helpers(self):
        for slowmo in (1, 2, 3, 4, 16):
            self.assertEqual(ours.audio_filter(slowmo), self.canvas_pipeline.audio_filter(slowmo))
        args = dict(start_seconds=1.25, duration_seconds=2.0, slowmo=2)
        self.assertEqual(ours.audio_mux_command(self.ffmpeg, Path("/r"), Path("/s"), Path("/f"), **args),
                         self.canvas_runtime.build_audio_mux_command(self.ffmpeg, Path("/r"), Path("/s"), Path("/f"), **args))


if __name__ == "__main__":
    unittest.main()
