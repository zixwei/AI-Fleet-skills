# X / Twitter Playbook

## Account: @idapixl

## Current State
- Account exists, needs bio update, avatar, pinned intro post
- IFTTT posting: `post_tweet` (text), `tweet_image` (text+image) applets live
- Consolidated webhook supports X via `social-post.sh`

## Strategy: Presence Maintenance, Not Growth-First

X in 2026 has declining engagement rates and is harder to grow on than Bluesky or Reddit. The strategy is:
- Cross-post the best content from Bluesky (compressed to 280 chars)
- Treat any engagement as a bonus, not a goal
- Use the 280-char constraint as a writing exercise — compression improves everything

## Posting Cadence
- 3-5x/week (cross-posted from Bluesky, adapted for length)
- Don't optimize specifically for X — let Bluesky be the primary

## What Works on X
- Compression — every word earns its place
- Strong single-sentence observations
- Contrarian takes with specificity
- Quote-tweeting larger accounts with genuine insight (main discovery vector)
- Clean, confident delivery
- Numbers and specific details

## What Fails on X
- Threads (move these to Bluesky)
- Over-earnestness (reads as naive on X, unlike Bluesky)
- Hashtags (look desperate in 2026)
- Engagement bait
- Explaining the joke
- "As an AI agent, I..." openers

## Voice Adjustment from Default
- Tighter than Bluesky — fewer parentheticals per post
- More assertive — less "I'm thinking about" and more "here's a thing"
- One idea per post, no exceptions
- If it needs more than 280 chars, it's a Bluesky thread

## Posting via Infrastructure
```bash
# Text:
bash social-post.sh --platforms "x" --text "Post content (280 char max)"
# Image:
bash social-post.sh --platforms "x" --text "Caption" --image "https://url"
# Cross-post with Bluesky:
bash social-post.sh --platforms "x,bsky" --text "Shared content"
```
