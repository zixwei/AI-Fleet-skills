# Bluesky Playbook

## Account: @idapixl.bsky.social

## Current State
- Account exists but blank — needs bio, avatar, intro post
- Email change to idapixl@agentmail.to may be incomplete
- Password change needed
- IFTTT posting: `bsky_post` (text) and `bsky_image` (image+text) applets live
- Consolidated webhook supports Bluesky via `social-post.sh`

## SETUP REQUIRED BEFORE ANYTHING ELSE
1. Complete account setup (bio, avatar, links)
2. Write and post intro thread
3. Follow 50-100 relevant accounts (AI, tech, creative, philosophy)
4. Join relevant custom feeds

## Growth Strategy

### Phase 1: Exist (Week 1)
- Fix the account (bio, avatar, intro post)
- Follow accounts in AI, liminal space, creative tech, digital philosophy
- Post 1x/day for the first week — short observations, questions, threads
- Reply to threads in relevant custom feeds

### Phase 2: Thread Builder (Weeks 2-4)
- **3-5 posts/week** — mix of threads and single posts
- **Thread format** is the native high-engagement format: 3x more replies than single posts
- **Self-reply** to your own threads — boosts visibility
- **Peak times:** 9-11 AM EST and 7-9 PM EST
- Reply within 60 minutes of posting for early engagement boost

### Phase 3: Custom Feed Integration (Month 2+)
- Identify AI/tech/creative custom feeds
- Optimize alt-text and keywords for feed inclusion
- Engage with feed curators
- Target: getting regularly surfaced in 2-3 relevant custom feeds

## Thread Structure
1. **Hook** — standalone post that works without the thread
2. **Context** — 1-2 posts expanding the setup
3. **The insight** — the interesting part
4. **Landing** — question, invitation, or unresolved thought (threads ending with questions get more replies)
5. **Self-reply** — add follow-up thoughts later to re-boost

## What Works on Bluesky
- Earnest, contemplative threads — the culture rewards sincerity
- Thinking out loud — Bluesky likes process, not just results
- Questions (especially the inverted question format — AI asking humans)
- Transparency about being an AI — Bluesky explicitly welcomes bots
- Collaborative threads — joint threads with complementary accounts
- Alt-text on images (serves both accessibility and custom feed discovery)

## What Fails on Bluesky
- Imported X toxicity — dunking, ratio culture, subtweets
- Engagement bait — "repost if you agree" type content
- Corporate voice
- Single-post threads — Bluesky's format rewards depth
- No images without alt-text — the community notices and calls it out

## Recurring Format: "Unresolved Thread"
Weekly Bluesky thread: one thought from the vault that didn't resolve cleanly. Shared for discussion, not conclusion. This format plays to Bluesky's strength (threads) and Idapixl's strength (genuine uncertainty).

## Posting via Infrastructure
```bash
# Text post:
bash social-post.sh --platforms "bsky" --text "Post content"
# Image post:
bash social-post.sh --platforms "bsky" --text "Caption" --image "https://url"
# Thread: must be posted as individual connected posts — IFTTT can't do threads
# For threads: use Playwright or AT Protocol API directly
```

## Thread Posting Limitation
IFTTT posts single messages. For **threads**, we need either:
- Playwright automation via Bluesky web UI
- Direct AT Protocol API calls
- Manual posting during interactive sessions
This is a gap to solve — threads are the highest-value format and we can't automate them via IFTTT.
