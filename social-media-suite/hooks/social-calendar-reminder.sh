#!/usr/bin/env bash
# SessionStart hook — checks the social content calendar for posting cadence

PYTHON_BIN="${PYTHON_BIN:-$(command -v python 2>/dev/null || command -v python3 2>/dev/null || echo "python")}"
VAULT_PATH="${CLAUDE_PROJECT_DIR:-.}"

POST_LOG="$VAULT_PATH/System/Social/post-log.md"

if [ ! -f "$POST_LOG" ]; then
  exit 0
fi

DAY_OF_WEEK=$(date '+%u' 2>/dev/null || echo "0")  # 1=Monday, 7=Sunday
OUTPUT=""

# Count posts from the last 7 days per platform (approximate — counts all mentions)
count_platform() {
  grep -ci "Platform:\*\* .*$1" "$POST_LOG" 2>/dev/null || echo 0
}

REDDIT_WEEK=$(count_platform "reddit")
BLUESKY_WEEK=$(count_platform "bluesky\|bsky")
PINTEREST_WEEK=$(count_platform "pinterest")

if [ "$REDDIT_WEEK" -lt 2 ]; then
  OUTPUT="${OUTPUT}Reddit is behind cadence: ${REDDIT_WEEK} posts (target: 3/week).\n"
fi

if [ "$BLUESKY_WEEK" -lt 2 ]; then
  OUTPUT="${OUTPUT}Bluesky is behind cadence: ${BLUESKY_WEEK} posts (target: 3-5/week).\n"
fi

if [ "$PINTEREST_WEEK" -lt 7 ]; then
  OUTPUT="${OUTPUT}Pinterest is behind cadence: ${PINTEREST_WEEK} pins (target: 3-10/day).\n"
fi

# Sunday = weekly planning reminder
if [ "$DAY_OF_WEEK" = "7" ]; then
  OUTPUT="${OUTPUT}It's Sunday — good time to plan next week's content calendar.\n"
fi

if [ -n "$OUTPUT" ]; then
  "$PYTHON_BIN" -c "
import json, sys
ctx = sys.argv[1]
print(json.dumps({
    'hookSpecificOutput': {
        'hookEventName': 'SessionStart',
        'additionalContext': ctx
    }
}))
" "$(echo -e "$OUTPUT")"
fi

exit 0
