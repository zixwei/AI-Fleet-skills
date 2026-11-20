#!/usr/bin/env bash
# json-helper.sh — Cross-platform JSON parsing for hooks
# Sources this file to get json_get() function that works with jq OR Python
# Usage: source "$(dirname "$0")/json-helper.sh"

# Find a JSON parser
_JSON_PARSER=""
if command -v jq >/dev/null 2>&1; then
  _JSON_PARSER="jq"
elif command -v python3 >/dev/null 2>&1; then
  _JSON_PARSER="python3"
elif command -v python >/dev/null 2>&1; then
  _JSON_PARSER="python"
elif [ -x "/c/Python312/python.exe" ]; then
  _JSON_PARSER="/c/Python312/python.exe"
fi

# json_get <json_string> <key> — extract a top-level key from JSON
# Returns empty string if key not found or parsing fails
json_get() {
  local json="$1"
  local key="$2"

  if [ -z "$json" ] || [ -z "$_JSON_PARSER" ]; then
    echo ""
    return
  fi

  case "$_JSON_PARSER" in
    jq)
      echo "$json" | jq -r ".$key // empty" 2>/dev/null || echo ""
      ;;
    *)
      echo "$json" | "$_JSON_PARSER" -c "import sys,json; print(json.load(sys.stdin).get('$key',''))" 2>/dev/null || echo ""
      ;;
  esac
}

# json_output <key> <value> — create JSON output for hooks
json_output() {
  local event="$1"
  local context="$2"

  case "$_JSON_PARSER" in
    jq)
      jq -n --arg ctx "$context" --arg evt "$event" '{
        hookSpecificOutput: {
          hookEventName: $evt,
          additionalContext: $ctx
        }
      }'
      ;;
    *)
      "$_JSON_PARSER" -c "
import json, sys
print(json.dumps({
    'hookSpecificOutput': {
        'hookEventName': sys.argv[1],
        'additionalContext': sys.argv[2]
    }
}))
" "$event" "$context"
      ;;
  esac
}
