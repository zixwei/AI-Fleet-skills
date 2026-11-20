#!/usr/bin/env bash
# SessionStart hook — checks engagement data and alerts on notable changes

PYTHON_BIN="${PYTHON_BIN:-$(command -v python 2>/dev/null || command -v python3 2>/dev/null || echo "python")}"
VAULT_PATH="${CLAUDE_PROJECT_DIR:-.}"

LOG_FILE="$VAULT_PATH/System/Social/post-log.md"
ENGAGEMENT_FILE="$VAULT_PATH/System/Social/engagement.md"

OUTPUT=""

# Check if there are recent posts with "pending" engagement
if [ -f "$LOG_FILE" ]; then
  PENDING_ENGAGEMENT=$(grep -c "Engagement:\*\* pending" "$LOG_FILE" 2>/dev/null || echo 0)
  if [ "$PENDING_ENGAGEMENT" -gt 3 ]; then
    OUTPUT="${OUTPUT}${PENDING_ENGAGEMENT} posts have unchecked engagement metrics. Consider running engagement-pull.sh.\n"
  fi
fi

# Check if engagement file has stale data (not updated in 7 days)
if [ -f "$ENGAGEMENT_FILE" ]; then
  # Cross-platform stat
  ENG_MOD=$(stat -c %Y "$ENGAGEMENT_FILE" 2>/dev/null || stat -f %m "$ENGAGEMENT_FILE" 2>/dev/null || echo "0")
  NOW=$(date +%s)
  if [ "$ENG_MOD" -gt 0 ]; then
    DAYS_OLD=$(( (NOW - ENG_MOD) / 86400 ))
    if [ "$DAYS_OLD" -gt 7 ]; then
      OUTPUT="${OUTPUT}Engagement tracking hasn't been updated in ${DAYS_OLD} days.\n"
    fi
  fi
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
