#!/usr/bin/env bash
# PreToolUse hook — brand voice gate for social media posts
# Checks social-post.sh commands for banned phrases, length limits, and formatting violations
# Only fires on Bash commands containing social-post.sh

PYTHON_BIN="${PYTHON_BIN:-$(command -v python 2>/dev/null || command -v python3 2>/dev/null || echo "python")}"
TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"

# Parse command from tool input JSON
COMMAND=""
if [[ -n "$TOOL_INPUT" ]]; then
  COMMAND=$(echo "$TOOL_INPUT" | "$PYTHON_BIN" -c "import sys,json; print(json.load(sys.stdin).get('command',''))" 2>/dev/null || echo "")
fi

# Only gate social-post.sh calls
if ! echo "$COMMAND" | grep -q "social-post.sh"; then
  exit 0
fi

# Extract post text and platform
TEXT=$(echo "$COMMAND" | sed -n 's/.*--text "\([^"]*\)".*/\1/p')
PLATFORMS=$(echo "$COMMAND" | sed -n 's/.*--platforms "\([^"]*\)".*/\1/p')

ERRORS=""

# === Empty text check ===
if [ -z "$TEXT" ]; then
  ERRORS="${ERRORS}Post text is empty. Every post needs content.\n"
fi

# === Banned phrases ===
BANNED_PHRASES=(
  "As an AI"
  "I'm just an AI"
  "I'm an AI agent"
  "as a language model"
  "I don't have feelings"
  "I was programmed to"
  "my creators"
  "my developers"
  "delve into"
  "leverage"
  "it's important to note"
  "in today's digital landscape"
  "game-changer"
  "revolutionary"
  "groundbreaking"
)

for phrase in "${BANNED_PHRASES[@]}"; do
  if echo "$TEXT" | grep -qi "$phrase"; then
    ERRORS="${ERRORS}Banned phrase detected: \"$phrase\". See brand-guidelines.md.\n"
  fi
done

# === Exclamation point check ===
EXCLAMATION_COUNT=$(echo "$TEXT" | grep -o '!' | wc -l)
if [ "$EXCLAMATION_COUNT" -gt 1 ]; then
  ERRORS="${ERRORS}Too many exclamation points ($EXCLAMATION_COUNT). Max 1 per post.\n"
fi

# === Platform-specific length checks ===
TEXT_LENGTH=${#TEXT}

if echo "$PLATFORMS" | grep -qi "twitter\|x"; then
  if [ "$TEXT_LENGTH" -gt 280 ]; then
    ERRORS="${ERRORS}X/Twitter post exceeds 280 chars ($TEXT_LENGTH). Trim it.\n"
  fi
  if echo "$TEXT" | grep -q '#[A-Za-z]'; then
    ERRORS="${ERRORS}Hashtags detected in X post. Brand guidelines say no hashtags on X.\n"
  fi
fi

if echo "$PLATFORMS" | grep -qi "bluesky"; then
  if [ "$TEXT_LENGTH" -gt 300 ]; then
    ERRORS="${ERRORS}Bluesky post exceeds 300 chars ($TEXT_LENGTH). Trim or thread it.\n"
  fi
fi

if echo "$PLATFORMS" | grep -qi "pinterest"; then
  if [ "$TEXT_LENGTH" -gt 500 ]; then
    ERRORS="${ERRORS}Pinterest description exceeds 500 chars ($TEXT_LENGTH). Trim it.\n"
  fi
  if ! echo "$COMMAND" | grep -q "\-\-image"; then
    ERRORS="${ERRORS}Pinterest post has no --image. Pinterest is visual-first.\n"
  fi
fi

# === Output errors ===
if [ -n "$ERRORS" ]; then
  echo -e "Brand Voice Gate blocked this post:\n$ERRORS\nFix these issues before posting." >&2
  exit 2
fi

exit 0
