# lipnardo

Production-grade [Claude Code](https://claude.ai/code) skill for AI avatar talking-head video generation, powered by the [HeyGen REST API](https://developers.heygen.com).

Fills the gaps in HeyGen's 11 official skills: batch generation, template variable injection, photo-to-avatar pipeline, credit estimation, webhook management, and crash-recoverable orchestration.

## Quick Start (2 minutes)

### Step 1: Get a HeyGen API key

Sign up at [app.heygen.com](https://app.heygen.com), then go to **Settings → API** and create a key. Pay-as-you-go starts at a $5 minimum balance.

### Step 2: Download and install

```bash
git clone https://github.com/AgriciDaniel/lipnardo.git
cd lipnardo
bash install.sh
```

**Windows** (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The installer:
- Checks Python 3.8+ is available
- Symlinks the skill into `~/.claude/skills/lipnardo/`
- Creates `~/Documents/lipnardo_videos/` for output
- Optionally writes your API key to `~/.heygen/config.json` (chmod 600)

### Step 3: Make videos

Open Claude Code and say:

> "Generate a 30-second avatar video saying: Welcome to Acme Industries"

Or use the command directly:

```
/lipnardo generate --prompt "A professional explaining quarterly results" --aspect-ratio 16:9
```

## What You Can Do

| Say this... | What happens |
|-------------|-------------|
| "Generate an avatar video saying X" | AI Video Agent creates it (v3 endpoint) |
| "Make a multi-scene video from this script" | Studio mode (up to 50 scenes) |
| "Generate 100 personalized videos from this CSV" | Batch mode with 3-concurrent queue |
| "Translate this video to Spanish with lip-sync" | v3 translation, speed or precision mode |
| "Turn this photo into a talking avatar" | Full Photo Avatar IV training pipeline |
| "Convert this text to speech" | Starfish TTS engine |
| "How much will this cost?" | Pre-flight cost estimation |
| "Download video XYZ before the URL expires" | Local download with retry |

## Features

- **12 production scripts**, ~3,500 lines, **stdlib-only** (zero `pip install`)
- **3 generation modes**: Video Agent (v3), Studio (v2), Template
- **Batch orchestration** with concurrent limit, retry, exponential backoff, and crash-recoverable manifests
- **Cost ledger** at `~/.heygen/costs.json` (chmod 600, atomic writes)
- **Translation** with `speed` or `precision` mode (v3 endpoint)
- **Photo Avatar IV pipeline**: upload → group → train → generate
- **Webhook management** for async generation
- **Security-hardened**: SSRF guards, batch financial caps, ID sanitization

## Requirements

- **Claude Code** — [Get it here](https://claude.ai/code) (CLI, Desktop, or VS Code extension)
- **Python 3.8+** — stdlib only, no extra packages required
- **HeyGen API key** — free signup, $5 minimum balance for first paid generation
- **Internet** — videos are generated on HeyGen's servers, then downloaded locally

## Pricing

Pricing is set by HeyGen and billed to your API balance. Lipnardo does not add fees.

| Feature | Cost / second | Per minute |
|---|---|---|
| Avatar III video | $0.0167 | ~$1.00 |
| Video Agent (v3) | $0.0333 | ~$2.00 |
| Photo Avatar (IV) | $0.0500 | ~$3.00 |
| Digital Twin (IV) | $0.0667 | ~$4.00 |
| Translation (speed) | $0.0333 | ~$2.00 |
| Translation (precision) | $0.0667 | ~$4.00 |
| Starfish TTS | $0.000667 | ~$0.04 |

Use `/lipnardo credits estimate` before any generation. Use `--test true` for free watermarked iterations during development.

## Commands Reference

```
/lipnardo generate <prompt>      Video Agent (v3) generation
/lipnardo studio <config.json>   Multi-scene Studio (v2)
/lipnardo batch <file.csv>       Batch generation from CSV/JSON
/lipnardo template list          List HeyGen templates
/lipnardo template inspect <id>  Show template variables
/lipnardo template generate <id> Generate from template
/lipnardo translate <id> <lang>  Translate with lip-sync
/lipnardo tts <text>             Starfish TTS
/lipnardo avatar create <photo>  Photo Avatar IV pipeline
/lipnardo avatar list            List available avatars
/lipnardo avatar voices          List TTS voices
/lipnardo assets upload <file>   Upload to HeyGen
/lipnardo assets list            List uploaded assets
/lipnardo credits                API balance check
/lipnardo credits estimate       Pre-flight cost estimate
/lipnardo download <id>          Download video before URL expires
/lipnardo webhook register <url> Register webhook endpoint
/lipnardo setup                  Validate API key and configuration
```

## API Constraints

- **3 concurrent videos** max on standard plans (batch script respects this)
- **30 minutes** max per video (Enterprise required for longer)
- **1080p** default resolution (4K Enterprise only)
- **Photo Avatar IV**: 3 minutes hard limit
- **Download URLs**: expire after 7 days — download promptly
- **50 scenes** max per Studio API request

For sustained 500+ videos/month, contact HeyGen sales for Enterprise API pricing (typical 30-50% discount on list + higher concurrent limits).

## Architecture

<details>
<summary>Click to expand (for developers)</summary>

```
lipnardo/
├── README.md, LICENSE, SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md
├── install.sh, install.ps1, uninstall.sh
├── .gitignore
└── skills/lipnardo/
    ├── SKILL.md                    # Skill manifest (Agent Skills standard)
    └── scripts/
        ├── heygen_client.py        # Importable: auth, HTTP, polling, download, validation
        ├── generate_video.py       # Video Agent (v3) + Studio (v2)
        ├── batch_generate.py       # Queue manager with retry + crash recovery
        ├── template_video.py       # Template list/inspect/generate
        ├── translate_video.py      # Translation v3 (speed | precision)
        ├── tts.py                  # Starfish TTS
        ├── photo_avatar.py         # Avatar IV pipeline
        ├── asset_manager.py        # Upload/list assets
        ├── credit_check.py         # Balance/estimate/log/summary
        ├── download_video.py       # URL-validated download
        ├── webhook_manager.py      # Webhook endpoint CRUD
        └── validate_setup.py       # Pre-flight check
    ├── references/                 # 4 on-demand docs (API, costs, errors, avatars)
    └── examples/                   # 3 worked examples
```

**Tier 2 architecture**: single SKILL.md + scripts (not Tier 3 sub-skills) because all capabilities share auth, HTTP, polling, and download logic. The shared module pattern (`heygen_client.py` imported via `sys.path.insert(0, os.path.dirname(__file__))`) avoids code duplication.

**Direct REST API** (not MCP) because HeyGen's three integration paths use **separate billing pools**:

| Path | Auth | Billing |
|---|---|---|
| Remote MCP (`mcp.heygen.com`) | OAuth | Web plan premium credits |
| Local MCP (archived) | API key | API balance |
| Direct REST API (`api.heygen.com`) | API key | API balance — **what Lipnardo uses** |

</details>

## Security

This skill went through 3 review cycles before v1.0:

1. **Code review** — fixed Python 3.10 syntax in 3.8+ files, wrong subcommand names, batch variable format
2. **Live API verification** — fixed translation v2 endpoint silently ignoring `mode` parameter (users paying 2x for "quality" got "speed")
3. **8-agent cybersecurity audit** (78/100 → post-fix) — fixed SSRF via `file://`, batch financial safety gates ($20K spend prevention), file permissions, ID sanitization, negative cost loophole

See [SECURITY.md](SECURITY.md) for the threat model and how to report vulnerabilities.

## Uninstall

```bash
cd lipnardo
bash uninstall.sh
```

Removes the skill symlink. Your generated videos, API key, and cost ledger are untouched.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug fixes, additional reference docs, and Windows installer improvements are most welcome.

## License

MIT — see [LICENSE](LICENSE). HeyGen content and API output are governed by [HeyGen's terms](https://www.heygen.com/policy).

## Credits

- [HeyGen](https://www.heygen.com) for the avatar video API.
- [Claude Code](https://claude.ai/code) by Anthropic for the skill runtime.
- Sibling skills [claude-music](https://github.com/AgriciDaniel/claude-music) and [claude-seo](https://github.com/AgriciDaniel/claude-seo) for the architectural patterns.
