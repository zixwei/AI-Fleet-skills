#!/usr/bin/env bash
# Stop hook — catches orphaned drafts in the social queue at session end
# Alerts if there are drafts that have been sitting without approval

VAULT_PATH="${CLAUDE_PROJECT_DIR:-.}"
QUEUE_FILE="$VAULT_PATH/System/Social/queue.md"

if [ ! -f "$QUEUE_FILE" ]; then
  exit 0
fi

# Count drafts marked as "pending" or "ready" or "draft"
PENDING_COUNT=$(grep -ciE '^\s*-\s*\*\*Status:\*\*\s*(pending|ready|draft)' "$QUEUE_FILE" 2>/dev/null || echo 0)

if [ "$PENDING_COUNT" -gt 0 ]; then
  echo "There are $PENDING_COUNT unposted drafts in System/Social/queue.md. Review and post or discard them." >&2
fi

# Informational — don't block session end
exit 0
