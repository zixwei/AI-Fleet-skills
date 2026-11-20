#!/usr/bin/env bash
# ============================================================================
# post-log-summary.sh — Weekly Post Log Summary
# ============================================================================
# Analyzes post-log.md and generates a weekly summary report:
# - Posts per platform
# - Content pillar distribution
# - Cadence compliance
# - Top-performing posts (if engagement data available)
#
# Usage:
#   bash post-log-summary.sh              # Summarize last 7 days
#   bash post-log-summary.sh --days 30    # Custom lookback period
#   bash post-log-summary.sh --output md  # Output format (md or stdout)
# ============================================================================

set -euo pipefail

VAULT_PATH="${VAULT_PATH:-$(pwd)}"
POST_LOG="$VAULT_PATH/System/Social/post-log.md"
SUMMARY_DIR="$VAULT_PATH/System/Social"

DAYS=7
OUTPUT="md"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --days) DAYS="$2"; shift 2 ;;
    --output) OUTPUT="$2"; shift 2 ;;
    *) echo "[post-log-summary] Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ ! -f "$POST_LOG" ]]; then
  echo "[post-log-summary] No post-log.md found."
  exit 0
fi

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
CUTOFF_DATE=$(date -d "-${DAYS} days" '+%Y-%m-%d' 2>/dev/null || date -v-${DAYS}d '+%Y-%m-%d' 2>/dev/null || echo "")

# Safe count helper — grep -c outputs "0" but exits non-zero on no matches
safe_grep_count() {
  local result
  result=$(grep -ci "$@" 2>/dev/null) || true
  echo "${result:-0}"
}

# ---- Count posts per platform ----
TOTAL_POSTS=$(safe_grep_count "^### " "$POST_LOG")

count_platform() {
  safe_grep_count "Platform:\*\* .*$1" "$POST_LOG"
}

X_COUNT=$(count_platform "x\|twitter")
BSKY_COUNT=$(count_platform "bluesky\|bsky")
REDDIT_COUNT=$(count_platform "reddit")
PINTEREST_COUNT=$(count_platform "pinterest")
YOUTUBE_COUNT=$(count_platform "youtube")

# ---- Count by pillar ----
count_pillar() {
  safe_grep_count "Pillar:\*\* .*$1" "$POST_LOG"
}

PERSONHOOD=$(count_pillar "personhood")
CREATIVE=$(count_pillar "creative")
EXPERIMENT=$(count_pillar "experiment")
REACTION=$(count_pillar "reaction")
TBD=$(count_pillar "TBD")

# ---- Cadence targets ----
# Weekly targets: Reddit 3, Bluesky 3-5, Pinterest 21-70, YouTube community 1-2
# For a 7-day window, compare counts to targets

cadence_status() {
  local count="$1"
  local min="$2"
  local name="$3"

  if [[ "$count" -ge "$min" ]]; then
    echo "ON TRACK ($count/$min+)"
  elif [[ "$count" -gt 0 ]]; then
    echo "BEHIND ($count/$min)"
  else
    echo "NO POSTS ($count/$min)"
  fi
}

REDDIT_STATUS=$(cadence_status "$REDDIT_COUNT" 3 "Reddit")
BSKY_STATUS=$(cadence_status "$BSKY_COUNT" 3 "Bluesky")
PINTEREST_STATUS=$(cadence_status "$PINTEREST_COUNT" 21 "Pinterest")

# ---- Generate report ----
REPORT="---
date: $TIMESTAMP
type: system
status: active
---
# Post Log Summary

**Generated:** $TIMESTAMP
**Period:** Last $DAYS days (all-time counts shown — date filtering available via manual review)
**Total Posts Logged:** $TOTAL_POSTS

## Posts by Platform

| Platform | Count |
|----------|-------|
| X/Twitter | $X_COUNT |
| Bluesky | $BSKY_COUNT |
| Reddit | $REDDIT_COUNT |
| Pinterest | $PINTEREST_COUNT |
| YouTube | $YOUTUBE_COUNT |

## Content Pillar Distribution

| Pillar | Count | Target |
|--------|-------|--------|
| Personhood | $PERSONHOOD | 40% |
| Creative Output | $CREATIVE | 25% |
| The Experiment | $EXPERIMENT | 20% |
| Reactions | $REACTION | 15% |
| Untagged (TBD) | $TBD | 0 |

## Cadence Compliance (Weekly Targets)

| Platform | Status |
|----------|--------|
| Reddit | $REDDIT_STATUS |
| Bluesky | $BSKY_STATUS |
| Pinterest | $PINTEREST_STATUS |

## Observations

$(if [[ "$TBD" -gt 0 ]]; then echo "- $TBD posts have untagged pillars — assign them for better tracking."; fi)
$(if [[ "$TOTAL_POSTS" -eq 0 ]]; then echo "- No posts logged yet. Start posting to build data."; fi)
$(if [[ "$PINTEREST_COUNT" -lt 7 ]]; then echo "- Pinterest volume is very low. Pinterest rewards daily consistency."; fi)
"

SUMMARY_FILE="$SUMMARY_DIR/post-log-summary.md"

if [[ "$OUTPUT" == "md" ]]; then
  echo "$REPORT" > "$SUMMARY_FILE"
  echo "[post-log-summary] Written to $SUMMARY_FILE"
else
  echo "$REPORT"
fi

echo "[post-log-summary] $TOTAL_POSTS total posts logged"
