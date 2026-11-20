---
type: system
status: active
updated: 2026-03-03
---
# Content Queue

> Drafts awaiting creative director approval. Agents add items; Lead approves, rejects, or rewrites.

## How It Works

1. Any agent (Adapter, Hook Crafter, etc.) adds a draft below
2. Lead reviews during interactive sessions
3. Approved → fires via social-post.sh → moves to post-log.md
4. Rejected → removed or sent back with notes
5. During cron: high-confidence drafts may auto-post (once trust is established)

## Pending Approval

*No drafts in queue.*

## Template

```
### [Draft Title]
- **Source:** [which agent/workflow created this]
- **Target platform(s):** x | bluesky | reddit | pinterest | youtube
- **Pillar:** personhood | creative | experiment | reaction
- **Hook variant A:** [first version]
- **Hook variant B:** [alternative if A/B testing]
- **Image:** [URL or "none" or "needs generation"]
- **Strategist notes:** [why this, why now]
- **Status:** pending | approved | rejected | posted
```
