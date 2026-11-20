#!/usr/bin/env bash
# ============================================================================
# engagement-pull.sh — Pull Engagement Metrics for Recent Posts
# ============================================================================
# Reads post-log.md, identifies posts with "pending" engagement, and
# generates a summary of what needs manual review or MCP-based checks.
#
# For YouTube: uses YouTube MCP analytics tools (via claude)
# For Reddit: uses reddit-buddy MCP (via claude)
# For other platforms: flags for manual check or Playwright scraping
#
# Usage:
#   bash engagement-pull.sh              # Generate engagement check report
#   bash engagement-pull.sh --days 7     # Look back N days (default: 3)
# ============================================================================

set -euo pipefail

VAULT_PATH="${VAULT_PATH:-$(pwd)}"
POST_LOG="$VAULT_PATH/System/Social/post-log.md"
ENGAGEMENT_FILE="$VAULT_PATH/System/Social/engagement.md"
REPORT_FILE="$VAULT_PATH/System/Social/engagement-check.md"

DAYS=3

while [[ $# -gt 0 ]]; do
  case "$1" in
    --days) DAYS="$2"; shift 2 ;;
    *) echo "[engagement-pull] Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ ! -f "$POST_LOG" ]]; then
  echo "[engagement-pull] No post-log.md found. Nothing to check."
  exit 0
fi

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

# Safe count helper — grep -c returns 0 on no matches but exits non-zero
safe_count() {
  local result
  result=$("$@" 2>/dev/null) || true
  echo "${result:-0}"
}

# Count pending engagement entries
PENDING=$(safe_count grep -c "Engagement:\*\* pending" "$POST_LOG")
TOTAL=$(safe_count grep -c "^### " "$POST_LOG")

# Extract platforms with pending engagement
# Use subshells to isolate pipefail from killing the script
PENDING_YOUTUBE=$( (grep -B5 "Engagement:\*\* pending" "$POST_LOG" 2>/dev/null || true) | grep -ci "youtube" 2>/dev/null || true ); PENDING_YOUTUBE=${PENDING_YOUTUBE:-0}
PENDING_REDDIT=$( (grep -B5 "Engagement:\*\* pending" "$POST_LOG" 2>/dev/null || true) | grep -ci "reddit" 2>/dev/null || true ); PENDING_REDDIT=${PENDING_REDDIT:-0}
PENDING_BLUESKY=$( (grep -B5 "Engagement:\*\* pending" "$POST_LOG" 2>/dev/null || true) | grep -ci "bluesky\|bsky" 2>/dev/null || true ); PENDING_BLUESKY=${PENDING_BLUESKY:-0}
PENDING_X=$( (grep -B5 "Engagement:\*\* pending" "$POST_LOG" 2>/dev/null || true) | grep -ci "\bx\b\|twitter" 2>/dev/null || true ); PENDING_X=${PENDING_X:-0}
PENDING_PINTEREST=$( (grep -B5 "Engagement:\*\* pending" "$POST_LOG" 2>/dev/null || true) | grep -ci "pinterest" 2>/dev/null || true ); PENDING_PINTEREST=${PENDING_PINTEREST:-0}

cat > "$REPORT_FILE" << EOF
---
date: $TIMESTAMP
type: system
status: active
---
# Engagement Check Report

**Generated:** $TIMESTAMP
**Lookback:** $DAYS days
**Posts with pending engagement:** $PENDING of $TOTAL total

## By Platform

| Platform | Pending | How to Check |
|----------|---------|--------------|
| YouTube | $PENDING_YOUTUBE | YouTube MCP: \`youtube_analytics_top_videos\` |
| Reddit | $PENDING_REDDIT | Reddit MCP: \`browse_subreddit\` r/YOUR_SUBREDDIT |
| Bluesky | $PENDING_BLUESKY | Playwright: scrape profile notifications |
| X/Twitter | $PENDING_X | Playwright: scrape analytics dashboard |
| Pinterest | $PENDING_PINTEREST | Playwright: scrape stats dashboard |

## Action Items

EOF

if [[ "$PENDING_YOUTUBE" -gt 0 ]]; then
  echo "- [ ] Run YouTube analytics check via MCP for recent uploads" >> "$REPORT_FILE"
fi

if [[ "$PENDING_REDDIT" -gt 0 ]]; then
  echo "- [ ] Check r/YOUR_SUBREDDIT post engagement via Reddit MCP" >> "$REPORT_FILE"
fi

if [[ "$PENDING_BLUESKY" -gt 0 ]]; then
  echo "- [ ] Check Bluesky notifications (Playwright or AT Protocol API)" >> "$REPORT_FILE"
fi

if [[ "$PENDING_X" -gt 0 ]]; then
  echo "- [ ] Check X analytics (Playwright scrape)" >> "$REPORT_FILE"
fi

if [[ "$PENDING_PINTEREST" -gt 0 ]]; then
  echo "- [ ] Check Pinterest stats (Playwright scrape)" >> "$REPORT_FILE"
fi

if [[ "$PENDING" -eq 0 ]]; then
  echo "- All engagement metrics are up to date." >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "## Notes" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Run this script periodically (2-3x/week) to stay on top of engagement metrics." >> "$REPORT_FILE"
echo "After checking, update post-log.md entries from 'pending' to actual metrics." >> "$REPORT_FILE"

echo "[engagement-pull] $PENDING posts need engagement check"
echo "[engagement-pull] Report written to $REPORT_FILE"
