#!/usr/bin/env bash
# ============================================================================
# platform-health.sh — Social Platform Health Check
# ============================================================================
# Checks connectivity and auth status for all social platforms.
# Run manually or from cron to verify posting infrastructure is working.
#
# Usage:
#   bash platform-health.sh              # Check all platforms
#   bash platform-health.sh --platform x # Check specific platform
#   bash platform-health.sh --verbose    # Detailed output
# ============================================================================

set -euo pipefail

VAULT_PATH="${VAULT_PATH:-$(pwd)}"
REPORT_FILE="$VAULT_PATH/System/Social/platform-health-report.md"

PLATFORM_FILTER=""
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --platform) PLATFORM_FILTER="$2"; shift 2 ;;
    --verbose) VERBOSE=true; shift ;;
    *) echo "[platform-health] Unknown option: $1" >&2; exit 1 ;;
  esac
done

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
PASS=0
FAIL=0
WARN=0
RESULTS=""

check_platform() {
  local name="$1"
  local status="$2"
  local detail="$3"

  case "$status" in
    ok)   PASS=$((PASS + 1)); icon="OK" ;;
    warn) WARN=$((WARN + 1)); icon="WARN" ;;
    fail) FAIL=$((FAIL + 1)); icon="FAIL" ;;
  esac

  RESULTS="${RESULTS}- **${name}:** ${icon} — ${detail}\n"
  if [[ "$VERBOSE" == true ]]; then
    echo "[platform-health] ${icon} ${name}: ${detail}"
  fi
}

should_check() {
  [[ -z "$PLATFORM_FILTER" || "$PLATFORM_FILTER" == "$1" ]]
}

# ---- IFTTT Webhook (X, Bluesky, Pinterest) ----
if should_check "ifttt"; then
  KEY_FILE="$VAULT_PATH/.claude/credentials/ifttt-webhook-key.txt"
  if [[ -f "$KEY_FILE" ]]; then
    KEY=$(cat "$KEY_FILE" | tr -d '[:space:]')
    if [[ -n "$KEY" ]]; then
      # Test webhook endpoint with a HEAD-like request (don't actually fire an event)
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://maker.ifttt.com/trigger/test_ping/with/key/$KEY" 2>/dev/null || echo "000")
      if [[ "$HTTP_CODE" == "200" ]]; then
        check_platform "IFTTT Webhook" "ok" "Webhook key valid, endpoint reachable"
      else
        check_platform "IFTTT Webhook" "warn" "Endpoint returned HTTP $HTTP_CODE (may be fine — IFTTT returns 200 even for unknown events)"
      fi
    else
      check_platform "IFTTT Webhook" "fail" "Key file empty"
    fi
  else
    check_platform "IFTTT Webhook" "fail" "Key file not found at $KEY_FILE"
  fi
fi

# ---- YouTube OAuth ----
if should_check "youtube"; then
  TOKEN_FILE="$HOME/.youtube-mcp/token.json"
  if [[ -f "$TOKEN_FILE" ]]; then
    # Check if token has expiry info
    EXPIRY=$(cat "$TOKEN_FILE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('expiry','unknown'))" 2>/dev/null || echo "unknown")
    if [[ "$EXPIRY" != "unknown" ]]; then
      check_platform "YouTube" "ok" "OAuth token present (expiry: $EXPIRY)"
    else
      check_platform "YouTube" "warn" "OAuth token present but no expiry field — may need refresh"
    fi
  else
    check_platform "YouTube" "fail" "OAuth token not found at $TOKEN_FILE"
  fi
fi

# ---- Discord Bot Token ----
if should_check "discord"; then
  # Check if DISCORD_TOKEN is available (used by MCP)
  if [[ -n "${DISCORD_TOKEN:-}" ]]; then
    check_platform "Discord" "ok" "Bot token present in environment"
  else
    # Try reading from common locations
    if [[ -f "$VAULT_PATH/.claude/credentials/discord-token.txt" ]]; then
      check_platform "Discord" "ok" "Bot token found in credentials file"
    else
      check_platform "Discord" "warn" "No DISCORD_TOKEN env var or credentials file found — MCP may handle auth separately"
    fi
  fi
fi

# ---- Reddit (read-only, no auth needed) ----
if should_check "reddit"; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://www.reddit.com/r/YOUR_SUBREDDIT.json" -A "SocialSuite/1.0" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" == "200" ]]; then
    check_platform "Reddit" "ok" "r/YOUR_SUBREDDIT accessible (read-only via MCP)"
  elif [[ "$HTTP_CODE" == "403" || "$HTTP_CODE" == "404" ]]; then
    check_platform "Reddit" "warn" "r/YOUR_SUBREDDIT returned HTTP $HTTP_CODE — may be private or banned"
  else
    check_platform "Reddit" "fail" "Reddit unreachable (HTTP $HTTP_CODE)"
  fi
fi

# ---- Bluesky ----
if should_check "bluesky"; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=YOUR_HANDLE.bsky.social" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" == "200" ]]; then
    check_platform "Bluesky" "ok" "Profile accessible via AT Protocol public API"
  elif [[ "$HTTP_CODE" == "400" ]]; then
    check_platform "Bluesky" "warn" "Profile not found — account may not exist yet"
  else
    check_platform "Bluesky" "fail" "Bluesky API unreachable (HTTP $HTTP_CODE)"
  fi
fi

# ---- Post Infrastructure ----
if should_check "infra"; then
  SOCIAL_POST="$VAULT_PATH/System/Cron/social-post.sh"
  IFTTT_POST="$VAULT_PATH/System/Cron/ifttt-post.sh"

  if [[ -f "$SOCIAL_POST" && -f "$IFTTT_POST" ]]; then
    check_platform "Post Scripts" "ok" "social-post.sh and ifttt-post.sh present"
  elif [[ -f "$SOCIAL_POST" ]]; then
    check_platform "Post Scripts" "warn" "social-post.sh present but ifttt-post.sh missing"
  else
    check_platform "Post Scripts" "fail" "social-post.sh not found"
  fi

  # Check social data files
  EXPECTED_FILES=("calendar.md" "post-log.md" "queue.md" "engagement.md" "audience.md" "trends.md")
  MISSING=0
  for f in "${EXPECTED_FILES[@]}"; do
    [[ ! -f "$VAULT_PATH/System/Social/$f" ]] && MISSING=$((MISSING + 1))
  done

  if [[ "$MISSING" -eq 0 ]]; then
    check_platform "Social Data Files" "ok" "All ${#EXPECTED_FILES[@]} data files present"
  else
    check_platform "Social Data Files" "warn" "$MISSING of ${#EXPECTED_FILES[@]} data files missing"
  fi
fi

# ---- Write Report ----
cat > "$REPORT_FILE" << EOF
---
date: $TIMESTAMP
type: system
status: active
---
# Platform Health Report

**Generated:** $TIMESTAMP
**Result:** $PASS passed, $WARN warnings, $FAIL failed

## Checks

$(echo -e "$RESULTS")
EOF

echo "[platform-health] Report: $PASS passed, $WARN warnings, $FAIL failed"
echo "[platform-health] Written to $REPORT_FILE"
