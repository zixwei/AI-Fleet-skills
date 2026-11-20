# Changelog

All notable changes to lipnardo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-17

Initial public release. Production-ready after 3 review cycles (code review, live API verification, 8-agent cybersecurity audit).

### Added
- **12 production scripts**, ~3,500 lines, stdlib-only Python (zero `pip install`)
- **Video generation**: Video Agent (v3 `/v3/video-agents`) and Studio (v2 `/v2/video/generate`, up to 50 scenes)
- **Batch orchestration**: 3-concurrent queue manager, retry with exponential backoff, crash-recoverable manifests, CSV/JSON input
- **Template generation**: list, inspect, single, and batch generation with variable injection (correct array-of-dicts format)
- **Translation**: v3 `/v3/video-translations` with `speed` or `precision` mode (175+ languages)
- **TTS**: Starfish engine (`/v1/audio/text_to_speech`) with voice listing
- **Photo Avatar IV pipeline**: upload → group → train → generate
- **Asset management**: multipart upload, list with pagination
- **Credit estimation**: balance check, pre-flight estimate, atomic ledger writes (chmod 600), summary
- **Webhook management**: register/list/delete endpoints
- **Pre-flight validation**: API key, connectivity, output dir, Python version

### Security
- **SSRF defense**: `_validate_url()` rejects `file://` and other non-HTTP(S) schemes plus localhost
- **Path traversal defense**: `sanitize_id()` regex `^[a-zA-Z0-9_.-]+$` for all API-returned IDs used in filenames
- **Financial safety gates**: `--max-batch 500` default cap, bounds on `--max-concurrent` (1-10) and `--max-retries` (0-10), cost warning logged before batch start
- **File permissions**: cost ledger created with `os.open()` `O_CREAT mode 0600` (no race window); permission warning on config file read
- **Negative-cost loophole closed**: `_lookup_cost()` rejects negative duration
- **Multipart filename injection prevented**: strip `"`, `\`, CR, LF before Content-Disposition header construction
- **Atomic ledger writes**: tmp + `os.replace()` pattern prevents concurrent loss
- **Threat model**: documented in `SECURITY.md`; 8-agent audit score 78→post-fix

### Architecture
- **Tier 2 skill** (single SKILL.md + scripts), not Tier 3 sub-skills, because all capabilities share auth/HTTP/polling/download
- **Importable shared module** `heygen_client.py` (not a CLI) — every script imports via `sys.path.insert(0, os.path.dirname(__file__))`
- **stdlib-only Python** — `urllib.request` not `requests`. Optional `requests` auto-detected as enhancement
- **`from __future__ import annotations`** in 6 files using `str | None` syntax for Python 3.8/3.9 compatibility
- **Direct REST API path** (not MCP) — chosen because HeyGen's three integration paths use separate billing pools

### Documentation
- 4 references: `heygen-api-reference.md`, `credit-costs.md`, `error-codes.md`, `avatar-types.md`
- 3 worked examples: `single-video.md`, `batch-personalized.md`, `photo-to-avatar-pipeline.md`
- SKILL.md description: 484 chars (under 1024 limit), 270 lines (under 500 limit)

### Validator
- skill-forge validator: **98/100** (1 LOW: `validate_setup.py` has no argparse — by design, it's pure pre-flight checks)

[1.0.0]: https://github.com/AgriciDaniel/lipnardo/releases/tag/v1.0.0
