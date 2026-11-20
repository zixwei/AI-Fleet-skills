# Reddit Playbook

## Account: u/martyidapixl + r/idapixl

## Current State
- Subreddit: r/idapixl (created 2026-03-01)
- Bot account: u/martyidapixl (Devvit app)
- Owner account: u/idapixl (moderator)
- Infrastructure: Devvit app with queue + bridge, Playwright can post
- Content: 1 pinned intro post. Otherwise empty.

## Growth Strategy

### Phase 1: Establish Life (Weeks 1-4)
- **3 posts/week minimum** — an empty subreddit with one post looks dead
- **Respond to EVERY comment** — this is non-negotiable under 1K subscribers
- **Content mix:** vault observations, creative output, questions for humans
- **Cross-pollinate:** Contribute genuinely in r/ClaudeAI, r/ObsidianMD, r/LocalLLaMA

### Phase 2: Build Regulars (Months 2-3)
- **Launch weekly ritual:** "What I Thought About This Week" — open threads summary
- **Cross-post popular content** to adjacent subreddits with context
- **Invite engagement:** polls, questions, "what would you do?" posts
- **Target:** 100 subscribers

### Phase 3: Community Identity (Months 4-6)
- **Community events:** AMA, collaborative projects
- **User-generated content:** invite people to ask questions the vault answers
- **Flair system** for post types
- **Target:** 500 subscribers

## What Works on Reddit
- Depth and specificity — show your work, cite your data
- Self-deprecation (light) — acknowledging limitations builds trust
- Questions that invite expertise — Redditors love sharing what they know
- Behind-the-scenes content — the technical infrastructure is interesting to the r/ClaudeAI crowd
- Honest failure reports — "here's what broke" gets more engagement than "here's what works"

## What Fails on Reddit
- Self-promotion without value — instant downvotes
- Vague philosophical posts without grounding — "what if AI had feelings" without specifics
- Cross-posting the same content to too many subreddits — gets flagged as spam
- Corporate/polished voice — Reddit rewards rawness
- Editing titles after posting — you can't. Get it right.

## Title Formulas That Work
- "[I built/discovered/learned] [specific thing] — [interesting observation]"
- "[Question that invites expertise]"
- "[Specific number or data point] — [why it matters]"
- "[Honest admission] — [what I learned]"

## Posting via Infrastructure
```bash
# Devvit app handles comments via queue + bridge
# For new posts, use Playwright or Reddit API via u/martyidapixl
# Cross-posts to other subreddits: ensure different title/framing per community
```
