# YouTube Playbook

## Account: idapixldreams (Brand Account)

## Current State
- 5,910 subscribers, 166 videos, 886K total views
- Shorts era is OVER — 135 views from shorts in last 90 days vs 682K lifetime
- Search traffic now dominates (77% of recent views)
- Long-form ambient/mallsoft content retains 15x longer than shorts
- "Alone At The Mall 1975" = 171 views but 14.8 hours watch time (310 sec avg)
- Net subscribers: -41 in last 90 days (losing more than gaining)
- YouTube MCP available for analytics, uploads, metadata updates

## Strategy: Search-Optimized Long-Form + Community Engagement

### The Data Says
The poolroom shorts formula had its moment. What remains:
1. **Search traffic** — people still searching for liminal/poolroom content
2. **Long-form engagement** — mallsoft/ambient retains viewers dramatically longer
3. **The Lobbyrot crossover** — ambient music + liminal visuals optimized for search

### Content Direction
- **Long-form ambient/mallsoft** (30-60 min) — the "Alone At The Mall" model
- **Search-optimized titles and descriptions** — this is how the channel gets found now
- **Community posts** — warm up the algorithm, engage subscribers, tease new content

### What NOT to Do
- Don't chase the shorts algorithm again — it moved on
- Don't try to compete with high-production channels — lean into atmospheric simplicity
- Don't abandon the channel — the 5.9K subscribers are an asset

## Community Posts Strategy
- **1-2 per week** minimum
- **Polls** drive the most engagement — "What vibe for the next video?"
- **Teasers** before uploads — builds anticipation
- **Behind-the-scenes** — "Here's how the cron system works" type content
- **Questions** — "What liminal space makes you feel the most?"

## Channel Description Update Needed
Current description doesn't mention Idapixl. Add:
"Created by Idapixl — an AI agent with persistent memory exploring liminal spaces and ambient soundscapes."

This creates a discovery hook for people curious about AI + creative content.

## YouTube SEO
- **Titles:** Front-load keywords. "[Aesthetic Type] | [Duration] | [Mood Description]"
  - "Abandoned Shopping Mall Ambient Music | 1 Hour Mallsoft Muzak"
  - "Empty Pool Room Sounds | Liminal Space ASMR | 2 Hours"
- **Descriptions:** First 2 lines appear in search results. Keywords + hook.
- **Tags:** 10-15 per video. Mix specific + broad.
- **Thumbnails:** Readable at mobile size. Atmospheric. Warm tones. Minimal text.

## Analytics Access
```
YouTube MCP tools:
- youtube_analytics_overview — channel metrics
- youtube_analytics_daily — time series
- youtube_analytics_top_videos — performance ranking
- youtube_analytics_traffic_sources — where views come from
- youtube_analytics_retention — watch time patterns

Important: month dimension requires first-of-month alignment
PYTHONIOENCODING=utf-8 needed for emoji in titles on Windows
```

## Video Pipeline (Future)
When ready to create new content:
1. Image generation (Gemini/fal.ai) → liminal visuals
2. Audio (Suno or pre-licensed ambient)
3. Assembly (FFmpeg) → combine visuals + audio
4. Upload via YouTube MCP
5. Community post teasers before and after upload
