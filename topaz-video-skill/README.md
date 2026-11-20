# Topaz Video Skill

**English** · [繁體中文](README.zh-TW.md)

An agent skill that lets **Claude Code** and **Codex** enhance local videos with the **licensed Topaz Video app already installed on your Mac**: upscaling, face restoration, denoising, animation enhancement, frame interpolation / slow motion, stabilization and motion deblur.

The agent always shows you a short preview and a before/after comparison first. It exports the full video only after you confirm, and writes the result next to the source together with a reproducible recipe.

![Topaz Video Skill overview](assets/overview.png)

> The illustrations use Traditional Chinese labels. Everything they show is described in English below.

## Why

Topaz Video gives great results, but each run means opening the GUI, choosing a model, tuning sliders and waiting for the export. This skill hands those steps to your coding agent:

- **Just ask.** Say "upscale this wedding clip to 4K". The agent looks at the footage, picks a preset and renders a 3-second preview.
- **Safe by default.** Invalid parameters are rejected while planning, and long full-length exports never start without your explicit confirmation.
- **No silent degradation.** If the inference process does not accept the license, or falls back to a watermark, no result is published.
- **Portable.** On any licensed Apple Silicon Mac, `git clone` plus `./install.sh` is all it takes. No services and no Python packages.

## Requirements

| Item | Notes |
|---|---|
| Hardware | Apple Silicon Mac (the models are CoreML) |
| Topaz Video | Installed at `/Applications/Topaz Video.app`, signed in and licensed, with the models you want already downloaded in the app |
| Python | `python3`; the macOS-provided 3.9 is enough, with no third-party packages |
| Agent | Claude Code, or Codex (app or CLI) |

Developed and validated with Topaz Video **1.7.1** on macOS 27 (M2 Max).

## Install

```bash
git clone https://github.com/DreamLoveBetty/topaz-video-skill.git ~/Projects/topaz-video-skill
cd ~/Projects/topaz-video-skill
./install.sh
```

`install.sh` symlinks the repo into `~/.claude/skills/topaz-video` and `~/.codex/skills/topaz-video` (it honours `CODEX_HOME`), so a `git pull` updates both. Use `./install.sh claude` or `./install.sh codex` for just one agent, and `./install.sh --uninstall` to remove the links.

On a new machine, run these once:

```bash
python3 scripts/tvai.py doctor          # app, license, models and filters
python3 scripts/tvai.py selftest        # ~5 s: license checkout, no watermark, output checks
python3 scripts/tvai.py selftest --all  # optional: every available model × scale (~1 min)
```

## Usage

Talk to your agent:

> Use Topaz to upscale ~/Movies/wedding.mp4 to 4K
>
> This night clip is really noisy, can you clean it up?
>
> Interpolate ~/Desktop/demo.mov to 60 fps, show me a preview first

The agent follows [SKILL.md](SKILL.md):

1. **Machine check**: runs `doctor`, plus `selftest` on a new machine.
2. **Look at the footage**: `inspect` extracts three stills, and the agent judges live action vs animation, faces, noise and shake.
3. **Choose a mode**: a panel offers **Auto** or **Manual**. It is skipped when your request is already specific.
4. **Plan and preview**: `plan` validates everything, then `run` renders a 3-second preview in the background.
5. **Compare and tune**: `compare` produces a before/after crop plus an estimate for the full export. Feedback such as "too plasticky" is translated into parameters and previewed again.
6. **Export after confirmation**: `export --confirmed` runs only after you agree, and writes next to the source.

![Preview comparison](assets/compare.jpg)

> This is real output of `compare`: a synthetic 320×180 fractal upscaled 4× with Rhea. Fractals are not natural footage, so the image only illustrates the comparison layout, not real-world quality.

## Interactive panels

![Interactive panels](assets/panels.png)

Both hosts show the same panels:

| Host | Tool | Notes |
|---|---|---|
| Claude Code | `AskUserQuestion` | always available |
| Codex | `request_user_input` | Plan mode only by default; see below |
| neither | numbered text menu | same questions and options |

Panels stay within both tools' limits: at most 3 options per question and 2 questions per call. The recommended option comes first, marked `(Recommended)`, and both hosts add a free-form "Other" automatically. Full JSON specs are in [references/interaction.md](references/interaction.md).

**Codex Default mode.** Codex exposes `request_user_input` only in Plan mode, which is read-only and cannot run GPU jobs. When the tool is missing, the skill:

1. Runs `scripts/bootstrap_interaction.py --json`, a read-only check.
2. If the result is `disabled`, asks for explicit consent to add `default_mode_request_user_input = true` under `[features]` in `~/.codex/config.toml`.
3. With consent, edits the file: backs it up, validates the change and rolls back on failure. It then asks you to fully restart Codex.
4. Finishes the current session with text menus.

## Built-in presets

Each preset is an ordered candidate chain. The skill picks the first model and scale that is available on this Mac, so machines with different downloads still work.

| Preset | Category | Purpose | Candidates (in order) |
|---|---|---|---|
| `enhance-2x` | Upscale | general 2× upscale | Artemis 2× → Rhea 2× → Theia 2× → Gaia 2× |
| `enhance-4x` | Upscale | large upscale of low-res footage | Rhea 4× → Proteus 4× |
| `portrait` | Restore | faces, low-quality footage | Iris 1× |
| `denoise` | Restore | night / low light / grain | Nyx 1× → Nyx 2× |
| `fidelity` | Restore | light, faithful enhancement | Theia 2× → Theia 1× |
| `animation` | Special | animation, cartoons, CG | Gaia Animation 2× → Gaia 2× |
| `general` | Special | enhance without resizing | Proteus 1× → Rhea 1× |

Stackable filters, depending on what each Mac has downloaded:

- `--add denoise` (Nyx 3)
- `--add interp:60` (Chronos / Apollo)
- `--add stabilize` (CPE / Refine)
- `--add deblur` (Themis)

Save a tuned recipe with `save-preset` and it appears under "My presets" in the panels.

## Tuning by feedback

| You say | First adjustment |
|---|---|
| still blurry | `--set details+=0.2` |
| noisy | `--set noise+=0.2` or `--add denoise:noise=0.3` |
| plastic / over-smoothed | `--set details+=0.15 --set blend=0.15` |
| compression blocks | `--set compression+=0.3` |
| halos | `--set halo+=0.2` |
| shaky | `--add stabilize` |
| motion blur | `--add deblur` |
| 60 fps / slow motion | `--add interp:60` / `--add interp:fps=0,slowmo=2` |

These are starting points, not Topaz recommendations. Every change is re-previewed with a comparison. See [references/tuning.md](references/tuning.md).

## Command reference

Every command is `python3 scripts/tvai.py <command>` and prints a single JSON object. When `ok` is false, `error` explains why.

| Command | Purpose | GPU |
|---|---|---|
| `doctor` | app, license, model and filter availability, verification records | no |
| `selftest [--all \| --model M]` | license checkout, no watermark and output checks on a synthetic clip | yes (seconds) |
| `presets` | presets, categories and per-machine resolution; feeds the panels | no |
| `inspect <video>` | media info plus three stills | no |
| `plan <video> --preset P [...]` | dry run: resolved model, output size, validation | no |
| `run <video> --preset P [...]` | background preview; returns a job id | yes |
| `run --from-job ID [...]` | re-run from a previous recipe with overrides | yes |
| `export --from-job ID --confirmed` | full-length export (`--confirmed` required) | yes |
| `wait ID [--timeout 540]` | wait and report progress or result | no |
| `status [ID]` / `jobs` | one job, or recent jobs | no |
| `compare ID [--count 3]` | before/after crops (left source, right result) | no |
| `cancel ID` | cancel and kill the whole process group | no |
| `save-preset NAME --from-job ID` | save a recipe as a personal preset | no |
| `prune [--days 7]` | delete old job scratch (exports are untouched) | no |

Common overrides:

- `--model` / `--scale`
- `--set key=v`, `key+=d`, `key-=d` (keys: `preblur noise details halo blur compression prenoise blend grain gsize`)
- `--add` / `--remove` filters
- `--encode h264|hevc|hevc10`, `--audio aac|mute`, `--bitrate Mbps`
- `--at seconds`, `--seconds length`

## Safety gates

| Gate | Behaviour |
|---|---|
| License checkout | every model pass must log an owned license checkout, otherwise no output |
| Watermark fallback | any watermark fallback marker fails the job |
| Output checks | frame count, dimensions and frame rate (including interpolation) must match exactly |
| No downloads | every Topaz filter runs with `download=0`; missing models must be downloaded in the app |
| License untouched | the directory holding `license.lic` is located and passed to Topaz's own ffmpeg; the file itself is never read or copied |
| Export confirmation | `export` refuses without `--confirmed`; SKILL.md allows it only after explicit user consent |
| Unattended runs | stop after the preview and never export |
| No overwrite | output names get `_2`, `_3`, … on collision |

## Architecture

![Architecture](assets/architecture.png)

The skill runs Topaz's bundled `ffmpeg` and `tvai_*` filters in place. `TVAI_MODEL_DIR` points at the directory that holds `license.lic`, and `TVAI_MODEL_DATA_DIR` points at the app's model download folder (read from the `veaiDataFolder` preference).

Each `run` creates a durable job and starts a detached worker. Only one Topaz job runs per Mac at a time, enforced by a file lock; other jobs queue. Cancelling kills the worker's entire process group. Command planning in `tvai_core/pipeline.py` is a set of pure functions.

## State, outputs and environment

- **Outputs**: `<name>_tvai_<preset>.mp4` next to the source, plus `.recipe.json` with the full recipe, app version and checks.
- **State**: `~/Library/Application Support/topaz-video-skill/` holds jobs, personal presets, stills and `verified.json` (recorded per app version). It survives upgrading or re-cloning the skill.

| Variable | Purpose |
|---|---|
| `TVAI_APP` | path to Topaz Video.app if not in the default location |
| `TVAI_MODEL_DATA_DIR` | override the model download folder |
| `TVAI_LICENSE_DIR` | override the directory containing `license.lic` |
| `TVAI_STATE_DIR` | override the state directory |

## Limitations

- Apple Silicon plus a licensed Topaz Video install only.
- **Not supported**: Starlight Precise / Mini and Hyperion 2 HDR. They need a separately validated Neuroserver runtime, which is planned for phase 2.
- Per-model scale lists are those validated on Topaz Video 1.7.1. Run `selftest --all` on other versions.
- Passing `selftest` proves the license and output checks, not long-video quality or speed.
- Export time estimates are extrapolated linearly from the preview, so first-load model time makes them pessimistic.
- A single clip selection is at most 600 s, and `export` defaults to the full video. The output's longest side must stay within 8192 px.

## Troubleshooting

| Message | What to do |
|---|---|
| Topaz Video app not found | check the install path or set `TVAI_APP` |
| license not found / not accepted | open Topaz Video, make sure you are signed in, then run `selftest` |
| download X in Topaz Video | run that model once in the app, or download it in the app's model manager |
| missing CoreML variant for this frame size | process a clip with the same orientation once in the app |
| output larger than 8192 | choose a smaller scale |
| Codex sandbox blocks a command | approve running it with escalated permissions (it writes the state dir and the source folder, and starts GPU processes) |
| `bootstrap_interaction.py` reports `error` | keep using text menus, or add `default_mode_request_user_input = true` under `[features]` manually |

## Development

```bash
python3 -m unittest discover -s tests          # portable, no Topaz needed
CANVASHUB_ROOT=/path/to/CanvasHub \
  python3 -m unittest discover -s tests        # plus the CanvasHub parity check
```

`tvai_core/pipeline.py` is ported from CanvasHub `backend/topaz_video` (commit `1587d6d`). The two projects **do not share code**. Instead, `tests/test_canvas_parity.py` compares the exact FFmpeg argument vectors both build, so a fix on one side fails the test until the other side reviews it.

## Credits and license

- [MIT License](LICENSE).
- `scripts/bootstrap_interaction.py` comes from [interactive-project-skill](https://github.com/DreamLoveBetty/interactive-project-skill) (MIT); see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- Topaz Video is a product of Topaz Labs. This project is not affiliated with Topaz Labs and contains or distributes no Topaz software, models or license files. You need your own valid Topaz Video license.
