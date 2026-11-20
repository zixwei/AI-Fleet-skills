#!/usr/bin/env bash
# PostToolUse hook — logs social media posts to System/Social/post-log.md
# Fires after Bash commands containing social-post.sh

PYTHON_BIN="${PYTHON_BIN:-$(command -v python 2>/dev/null || command -v python3 2>/dev/null || echo "python")}"
TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"
VAULT_PATH="${CLAUDE_PROJECT_DIR:-.}"

# Parse command from tool input JSON
COMMAND=""
if [[ -n "$TOOL_INPUT" ]]; then
  COMMAND=$(echo "$TOOL_INPUT" | "$PYTHON_BIN" -c "import sys,json; print(json.load(sys.stdin).get('command',''))" 2>/dev/null || echo "")
fi

# Only log social-post.sh calls (not dry-runs)
if ! echo "$COMMAND" | grep -q "social-post.sh"; then
  exit 0
fi
if echo "$COMMAND" | grep -q "\-\-dry-run"; then
  exit 0
fi

# Extract post details from the command
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
TEXT=$(echo "$COMMAND" | sed -n 's/.*--text "\([^"]*\)".*/\1/p')
PLATFORMS=$(echo "$COMMAND" | sed -n 's/.*--platforms "\([^"]*\)".*/\1/p')
IMAGE=$(echo "$COMMAND" | sed -n 's/.*--image "\([^"]*\)".*/\1/p')

LOG_FILE="$VAULT_PATH/System/Social/post-log.md"

if [ -n "$TEXT" ] && [ -n "$PLATFORMS" ]; then
  cat >> "$LOG_FILE" << EOF

### $TIMESTAMP
- **Platform:** $PLATFORMS
- **Pillar:** TBD
- **Content:** $TEXT
- **Image:** ${IMAGE:-none}
- **Engagement:** pending
- **Notes:** auto-logged by hook
EOF
fi

exit 0
