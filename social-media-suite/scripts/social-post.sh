#!/usr/bin/env bash
# ============================================================================
# social-post.sh — Cross-Platform Social Posting
# ============================================================================
# Posts content to multiple platforms via the consolidated IFTTT JSON webhook
# applet (social_post). One HTTP call routes to X, Bluesky, and Pinterest
# through filter code. Falls back to individual applets for platforms not
# in the consolidated applet (sms, linkedin, calendar).
#
# Usage:
#   bash social-post.sh --platforms "x,bsky" --text "Hello world"
#   bash social-post.sh --platforms "x,bsky,pinterest" --text "New art" --image "https://img.url" --board "Liminal"
#   bash social-post.sh --platforms "all" --text "Big announcement"
#   bash social-post.sh --platforms "sms" --text "Alert message"
#
# Platform codes:
#   x         — Twitter/X (@idapixl)
#   bsky      — Bluesky (@idapixl.bsky.social)
#   pinterest — Pinterest (idapixldreams) — requires --image
#   linkedin  — LinkedIn (Idapixl) — uses individual applet
#   sms       — Push notification via IFTTT app — uses individual applet
#   all       — x + bsky (not pinterest/linkedin/sms — those need extra args)
#
# Options:
#   --platforms  Comma-separated list of platform codes (required)
#   --text       Post text content (required)
#   --image      Image URL (optional, used where supported)
#   --board      Pinterest board name (optional, defaults to applet default)
#   --alt-text   Alt text for images (optional, defaults to --text)
#   --dry-run    Print what would be posted without actually posting
#   --legacy     Force legacy mode (individual applets per platform)
# ============================================================================

set -euo pipefail

VAULT_PATH="${VAULT_PATH:-$(pwd)}"
KEY_FILE="$VAULT_PATH/.claude/credentials/ifttt-webhook-key.txt"
IFTTT_SCRIPT="$VAULT_PATH/System/Cron/ifttt-post.sh"

# ---- Parse arguments ----
PLATFORMS=""
TEXT=""
IMAGE=""
BOARD=""
ALT_TEXT=""
DRY_RUN=false
LEGACY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --platforms) PLATFORMS="$2"; shift 2 ;;
    --text) TEXT="$2"; shift 2 ;;
    --image) IMAGE="$2"; shift 2 ;;
    --board) BOARD="$2"; shift 2 ;;
    --alt-text) ALT_TEXT="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --legacy) LEGACY=true; shift ;;
    *) echo "[social-post] Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$PLATFORMS" ]]; then
  echo "[social-post] ERROR: --platforms is required" >&2
  exit 1
fi

if [[ -z "$TEXT" ]]; then
  echo "[social-post] ERROR: --text is required" >&2
  exit 1
fi

# ---- Expand "all" ----
if [[ "$PLATFORMS" == "all" ]]; then
  PLATFORMS="x,bsky"
fi

# ---- Separate consolidated vs individual platforms ----
CONSOLIDATED_PLATFORMS=""  # x, bsky, pinterest — handled by social_post applet
INDIVIDUAL_PLATFORMS=""    # sms, linkedin — handled by individual applets

IFS=',' read -ra PLATFORM_LIST <<< "$PLATFORMS"
for PLATFORM in "${PLATFORM_LIST[@]}"; do
  PLATFORM=$(echo "$PLATFORM" | tr -d ' ')
  case "$PLATFORM" in
    x|bsky|pinterest)
      if [[ -n "$CONSOLIDATED_PLATFORMS" ]]; then
        CONSOLIDATED_PLATFORMS="$CONSOLIDATED_PLATFORMS,$PLATFORM"
      else
        CONSOLIDATED_PLATFORMS="$PLATFORM"
      fi
      ;;
    sms|linkedin)
      if [[ -n "$INDIVIDUAL_PLATFORMS" ]]; then
        INDIVIDUAL_PLATFORMS="$INDIVIDUAL_PLATFORMS,$PLATFORM"
      else
        INDIVIDUAL_PLATFORMS="$PLATFORM"
      fi
      ;;
    *)
      echo "[social-post] SKIP unknown platform: $PLATFORM" >&2
      ;;
  esac
done

SUCCESS=0
FAIL=0

# ---- Consolidated JSON webhook (x, bsky, pinterest in one call) ----
if [[ -n "$CONSOLIDATED_PLATFORMS" && "$LEGACY" == false ]]; then
  # Validate pinterest requirements
  if echo "$CONSOLIDATED_PLATFORMS" | grep -q "pinterest"; then
    if [[ -z "$IMAGE" ]]; then
      echo "[social-post] WARNING: pinterest requires --image, will be skipped by filter code" >&2
    fi
  fi

  if [[ ! -f "$KEY_FILE" ]]; then
    echo "[social-post] ERROR: Webhook key not found at $KEY_FILE" >&2
    exit 2
  fi

  KEY=$(cat "$KEY_FILE" | tr -d '[:space:]')
  URL="https://maker.ifttt.com/trigger/social_post/json/with/key/$KEY"

  # Build JSON payload
  PAYLOAD=$(python3 -c "
import json, sys
print(json.dumps({
    'platforms': sys.argv[1],
    'text': sys.argv[2],
    'image_url': sys.argv[3],
    'board': sys.argv[4],
    'alt_text': sys.argv[5] if sys.argv[5] else sys.argv[2]
}))
" "$CONSOLIDATED_PLATFORMS" "$TEXT" "${IMAGE:-}" "${BOARD:-}" "${ALT_TEXT:-}")

  if [[ "$DRY_RUN" == true ]]; then
    echo "[social-post] DRY RUN — consolidated JSON webhook:"
    echo "  URL: $URL"
    echo "  Payload: $PAYLOAD"
    echo "  Platforms: $CONSOLIDATED_PLATFORMS"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "[social-post] Posting to $CONSOLIDATED_PLATFORMS via JSON webhook..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -d "$PAYLOAD" \
      "$URL" 2>&1) || {
      echo "[social-post] ERROR: curl failed for consolidated webhook" >&2
      FAIL=$((FAIL + 1))
    }

    if [[ -n "${RESPONSE:-}" ]]; then
      HTTP_CODE=$(echo "$RESPONSE" | tail -1)
      BODY=$(echo "$RESPONSE" | head -n -1)

      if [[ "$HTTP_CODE" == "200" ]]; then
        echo "[social-post] OK — consolidated webhook fired ($CONSOLIDATED_PLATFORMS)"
        SUCCESS=$((SUCCESS + 1))
      else
        echo "[social-post] WARNING — consolidated webhook returned HTTP $HTTP_CODE: $BODY" >&2
        FAIL=$((FAIL + 1))
      fi
    fi
  fi
elif [[ -n "$CONSOLIDATED_PLATFORMS" && "$LEGACY" == true ]]; then
  # Legacy mode: fire individual applets
  IFS=',' read -ra CONS_LIST <<< "$CONSOLIDATED_PLATFORMS"
  for PLATFORM in "${CONS_LIST[@]}"; do
    case "$PLATFORM" in
      x)
        if [[ -n "$IMAGE" ]]; then EVENT="tweet_image"; V1="$TEXT"; V2="$IMAGE"; V3=""
        else EVENT="post_tweet"; V1="$TEXT"; V2=""; V3=""; fi ;;
      bsky)
        if [[ -n "$IMAGE" ]]; then EVENT="bsky_image"; V1="$IMAGE"; V2="$TEXT"; V3=""
        else EVENT="bsky_post"; V1="$TEXT"; V2=""; V3=""; fi ;;
      pinterest)
        if [[ -z "$IMAGE" ]]; then echo "[social-post] SKIP pinterest — --image required" >&2; FAIL=$((FAIL + 1)); continue; fi
        EVENT="pin_image"; V1="$IMAGE"; V2="$TEXT"; V3="${BOARD:-}" ;;
    esac
    if [[ "$DRY_RUN" == true ]]; then
      echo "[social-post] DRY RUN (legacy) — $PLATFORM → event=$EVENT"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "[social-post] Posting to $PLATFORM (legacy)..."
      if bash "$IFTTT_SCRIPT" "$EVENT" "$V1" "$V2" "$V3"; then SUCCESS=$((SUCCESS + 1))
      else echo "[social-post] FAILED: $PLATFORM" >&2; FAIL=$((FAIL + 1)); fi
    fi
  done
fi

# ---- Individual applets (sms, linkedin) ----
if [[ -n "$INDIVIDUAL_PLATFORMS" ]]; then
  IFS=',' read -ra IND_LIST <<< "$INDIVIDUAL_PLATFORMS"
  for PLATFORM in "${IND_LIST[@]}"; do
    case "$PLATFORM" in
      sms) EVENT="alert_virgil"; V1="$TEXT"; V2=""; V3="" ;;
      linkedin) EVENT="linkedin_post"; V1="$TEXT"; V2="${IMAGE:-}"; V3="" ;;
    esac

    if [[ "$DRY_RUN" == true ]]; then
      echo "[social-post] DRY RUN — $PLATFORM → event=$EVENT"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "[social-post] Posting to $PLATFORM (individual applet)..."
      if bash "$IFTTT_SCRIPT" "$EVENT" "$V1" "$V2" "$V3"; then
        SUCCESS=$((SUCCESS + 1))
      else
        echo "[social-post] FAILED: $PLATFORM" >&2
        FAIL=$((FAIL + 1))
      fi
    fi
  done
fi

echo "[social-post] Done — $SUCCESS succeeded, $FAIL failed."
