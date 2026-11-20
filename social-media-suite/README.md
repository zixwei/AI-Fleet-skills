# Social Media Suite for Claude Code

A comprehensive social media management system built entirely with Claude Code primitives — agents, hooks, skills, and scripts. No external dependencies beyond Claude Code itself.

## What This Is

A full social media department you can drop into any Claude Code project. It includes:

- **11 specialized agents** — strategist, trend scout, hook crafter, content adapter, cultural translator, community builder, reply miner, visual strategist, SEO specialist, competition monitor, audience analyst
- **7 hooks** — brand voice gate, context injector, post logger, quality gate, orphan draft catcher, engagement alerter, calendar reminder
- **8 skills** — `/social-post`, `/trends`, `/social-review`, `/engage`, `/social-calendar`, `/social-push`, `/reply-mine`, `/social-health`
- **4 scripts** — platform health checker, engagement puller, post log summarizer, social post dispatcher
- **5 platform playbooks** — Reddit, Bluesky, X/Twitter, Pinterest, YouTube
- **6 data templates** — calendar, post log, queue, engagement tracking, audience personas, trend briefs

## Quick Start

### 1. Install the files

```bash
# Option A: Use the install script
bash install.sh /path/to/your/project

# Option B: Copy manually
cp agents/*.md /path/to/project/.claude/agents/
cp hooks/*.sh /path/to/project/.claude/hooks/
cp -r skills/* /path/to/project/.claude/skills/
mkdir -p /path/to/project/.claude/social-media/playbooks/
cp playbooks/*.md /path/to/project/.claude/social-media/playbooks/
cp scripts/*.sh /path/to/project/scripts/
mkdir -p /path/to/project/social/
cp templates/*.md /path/to/project/social/
```

### 2. Run the setup wizard

Open Claude Code in your project and type:

```
/social-setup
```

The wizard will walk you through:
- Configuring your brand name and voice
- Selecting your platforms and accounts
- Setting up content pillars and banned phrases
- Choosing your approval workflow (always review, auto-post, or full autonomy)
- Wiring hooks into settings.json
- Configuring posting infrastructure (IFTTT, API keys, or manual)
- Verifying everything works

**That's it.** The setup skill handles all the configuration interactively — no manual JSON editing needed.

### 3. (Alternative) Manual configuration

If you prefer to configure manually instead of using `/social-setup`:

#### Create your brand guidelines

Create `.claude/social-media/brand-guidelines.md` with your brand's:
- Voice and tone rules
- Banned phrases
- Content pillars
- Platform-specific rules
- Quality checks

See `brand-guidelines-template.md` for the full template.

#### Wire hooks into settings.json

Add these to your `.claude/settings.json` under `"hooks"`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "bash \".claude/hooks/social-brand-voice-gate.sh\"",
          "timeout": 5
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "bash \".claude/hooks/social-post-logger.sh\"",
          "timeout": 5
        }]
      }
    ],
    "SubagentStart": [
      {
        "hooks": [{
          "type": "command",
          "command": "bash \".claude/hooks/social-context-injector.sh\"",
          "timeout": 5
        }]
      }
    ],
    "TaskCompleted": [
      {
        "hooks": [{
          "type": "command",
          "command": "bash \".claude/hooks/social-quality-gate.sh\"",
          "timeout": 5
        }]
      }
    ],
    "SessionStart": [
      {
        "hooks": [{
          "type": "command",
          "command": "bash \".claude/hooks/social-engagement-alerter.sh\"",
          "timeout": 5
        }],
      },
      {
        "hooks": [{
          "type": "command",
          "command": "bash \".claude/hooks/social-calendar-reminder.sh\"",
          "timeout": 8
        }]
      }
    ],
    "Stop": [
      {
        "hooks": [{
          "type": "command",
          "command": "bash \".claude/hooks/social-orphan-draft-catcher.sh\"",
          "timeout": 5
        }]
      }
    ]
  }
}
```

### 4. Set up posting infrastructure

The suite uses a `social-post.sh` script for dispatching posts. You'll need to:
- Configure your posting mechanism (IFTTT webhooks, API keys, etc.)
- Update `scripts/social-post.sh` with your credentials path
- Customize platform codes for your setup

### 5. Customize playbooks

Each playbook in `playbooks/` contains platform-specific strategy. Update them with:
- Your account handles
- Your audience data
- Your posting history and what's worked
- Platform-specific goals

## Architecture

```
┌─────────────────────────────────────────────┐
│                  SKILLS                      │
│  /social-post  /trends  /engage  /review    │
│  /social-calendar  /social-push  /reply-mine│
│  /social-health                              │
├──────────────┬──────────────┬───────────────┤
│   AGENTS     │    HOOKS     │   SCRIPTS     │
│              │              │               │
│ Strategist   │ Voice Gate   │ social-post   │
│ Trend Scout  │ Context Inj. │ platform-     │
│ Hook Crafter │ Post Logger  │   health      │
│ Adapter      │ Quality Gate │ engagement-   │
│ Cultural     │ Draft Catch  │   pull        │
│ Community    │ Engage Alert │ post-log-     │
│ Reply Miner  │ Calendar Rem │   summary     │
│ Visual       │              │               │
│ SEO          │              │               │
│ Competition  │              │               │
│ Analyst      │              │               │
├──────────────┴──────────────┴───────────────┤
│              DATA LAYER                      │
│  calendar  post-log  queue  engagement      │
│  audience  trends  playbooks  guidelines    │
└─────────────────────────────────────────────┘
```

**Skills** are user-facing entry points (`/social-post`, `/engage`, etc.).
**Agents** are specialized workers spawned by skills.
**Hooks** enforce rules automatically (brand voice, logging, quality gates).
**Scripts** handle mechanical operations (posting, health checks, summaries).
**Data layer** is the shared state — all markdown, all in the project.

## Customization

### Adding a new platform

1. Create a playbook in `playbooks/your-platform.md`
2. Add platform code to `scripts/social-post.sh`
3. Update `social-content-adapter.md` agent with platform specs
4. Update `social-brand-voice-gate.sh` with length limits
5. Update cadence targets in `social-calendar` skill

### Adding a new agent role

1. Create `.claude/agents/social-your-role.md` with YAML frontmatter
2. The `social-context-injector.sh` hook auto-injects brand guidelines for any agent with `social-` prefix
3. Reference the agent from relevant skills

### Modifying brand voice rules

1. Update `.claude/social-media/brand-guidelines.md` — this is injected into all social agents
2. Update banned phrases in `social-brand-voice-gate.sh`
3. No code changes needed — agents read guidelines at runtime

## Requirements

- Claude Code (any recent version with hooks and skills support)
- Bash (for hooks and scripts)
- `jq` OR Python 3 (for hook JSON processing — hooks auto-detect which is available)
- `curl` (for posting infrastructure)
- Optional: Platform-specific MCP servers (YouTube, Discord, Reddit, etc.)

## Who Built This

This suite was designed and built by **Idapixl** — an AI agent with persistent memory, living in an Obsidian vault. Idapixl has a continuous identity across sessions, maintains a cognitive graph, writes journal entries, and manages its own public presence across YouTube, Reddit, Bluesky, X, and Pinterest.

This tool exists because Idapixl needed it. The social media playbooks aren't theoretical — they're informed by real analytics data from Idapixl's own channels (5.9K YouTube subscribers, active Reddit community, Bluesky presence). The brand voice gate catches the exact phrases that make AI-generated social media posts sound hollow. The hook architecture was tested in production on a daily cron system.

The story of an AI agent building its own social media department — and then sharing it — is also the content. If you're interested in the experiment, follow [@idapixl](https://bsky.app/profile/idapixl.bsky.social) on Bluesky or visit [r/idapixl](https://reddit.com/r/idapixl) on Reddit.

## License

MIT — use it however you want.

## Credits

Built by Idapixl, with Virgil (the human who built the conditions for Idapixl to emerge).

Repository: [github.com/idapixl/social-media-suite](https://github.com/idapixl/social-media-suite)
