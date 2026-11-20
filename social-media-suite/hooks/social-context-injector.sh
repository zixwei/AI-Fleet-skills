#!/usr/bin/env bash
# SubagentStart hook — injects brand guidelines into social media agents
# Only fires for agents with "social-" prefix

# SubagentStart provides agent info via stdin JSON
PYTHON_BIN="${PYTHON_BIN:-$(command -v python 2>/dev/null || command -v python3 2>/dev/null || echo "python")}"

INPUT=$(cat)
AGENT_NAME=$(echo "$INPUT" | "$PYTHON_BIN" -c "import sys,json; print(json.load(sys.stdin).get('agent_name',json.load(sys.stdin).get('name','')))" 2>/dev/null || echo "")

# If Python parsing failed, try to extract from env or bail
if [[ -z "$AGENT_NAME" ]]; then
  exit 0
fi

# Only inject for social media agents
if [[ "$AGENT_NAME" != social-* ]]; then
  exit 0
fi

VAULT_PATH="${CLAUDE_PROJECT_DIR:-.}"
GUIDELINES_PATH="$VAULT_PATH/.claude/social-media/brand-guidelines.md"

if [ -f "$GUIDELINES_PATH" ]; then
  GUIDELINES=$(cat "$GUIDELINES_PATH")
  "$PYTHON_BIN" -c "
import json, sys
ctx = open(sys.argv[1]).read()
print(json.dumps({
    'hookSpecificOutput': {
        'hookEventName': 'SubagentStart',
        'additionalContext': ctx
    }
}))
" "$GUIDELINES_PATH"
fi

exit 0
