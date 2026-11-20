#!/usr/bin/env bash
# TaskCompleted hook — blocks posting tasks from completing without review
# Checks if the task is a social media posting task

PYTHON_BIN="${PYTHON_BIN:-$(command -v python 2>/dev/null || command -v python3 2>/dev/null || echo "python")}"

INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | "$PYTHON_BIN" -c "import sys,json; print(json.load(sys.stdin).get('task_subject',json.load(sys.stdin).get('subject','')))" 2>/dev/null || echo "")

# Only gate tasks that look like posting tasks
if ! echo "$TASK_SUBJECT" | grep -qiE '(post|publish|schedule|send.*social|fire.*webhook)'; then
  exit 0
fi

# Check if post-log was updated recently (within last 5 minutes)
VAULT_PATH="${CLAUDE_PROJECT_DIR:-.}"
LOG_FILE="$VAULT_PATH/System/Social/post-log.md"

if [ -f "$LOG_FILE" ]; then
  # Cross-platform stat for modification time
  if command -v stat >/dev/null 2>&1; then
    LOG_MOD=$(stat -c %Y "$LOG_FILE" 2>/dev/null || stat -f %m "$LOG_FILE" 2>/dev/null || echo "0")
    NOW=$(date +%s)
    DIFF=$((NOW - LOG_MOD))

    if [ "$DIFF" -gt 300 ]; then
      echo "Post task completing but post-log hasn't been updated. Did the post actually go out? Verify before marking complete." >&2
      exit 2
    fi
  fi
fi

exit 0
