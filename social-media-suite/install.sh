#!/usr/bin/env bash
# ============================================================================
# install.sh — Social Media Suite Installer for Claude Code
# ============================================================================
# Copies all suite components into a Claude Code project directory.
#
# Usage:
#   bash install.sh /path/to/your/project
#   bash install.sh .                          # Install to current directory
#   bash install.sh /path/to/project --dry-run # Preview without copying
# ============================================================================

set -euo pipefail

SUITE_DIR="$(cd "$(dirname "$0")" && pwd)"

TARGET=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    *) TARGET="$1"; shift ;;
  esac
done

if [[ -z "$TARGET" ]]; then
  echo "Usage: bash install.sh /path/to/project [--dry-run]"
  echo ""
  echo "Installs the Social Media Suite into a Claude Code project."
  exit 1
fi

TARGET=$(cd "$TARGET" && pwd)

if [[ ! -d "$TARGET/.claude" ]]; then
  echo "[install] WARNING: $TARGET/.claude doesn't exist. Creating it."
  $DRY_RUN || mkdir -p "$TARGET/.claude"
fi

copy_file() {
  local src="$1"
  local dest="$2"
  local dir=$(dirname "$dest")

  if [[ "$DRY_RUN" == true ]]; then
    echo "[dry-run] $src → $dest"
  else
    mkdir -p "$dir"
    cp "$src" "$dest"
    echo "[install] $dest"
  fi
}

copy_dir() {
  local src="$1"
  local dest="$2"

  if [[ "$DRY_RUN" == true ]]; then
    echo "[dry-run] $src/ → $dest/"
  else
    mkdir -p "$dest"
    cp -r "$src"/* "$dest/" 2>/dev/null || true
    echo "[install] $dest/"
  fi
}

echo "============================================"
echo "Social Media Suite — Installing to $TARGET"
echo "============================================"
echo ""

# Agents
echo "--- Agents ---"
for f in "$SUITE_DIR/agents/"*.md; do
  [[ -f "$f" ]] && copy_file "$f" "$TARGET/.claude/agents/$(basename "$f")"
done

# Hooks
echo ""
echo "--- Hooks ---"
for f in "$SUITE_DIR/hooks/"*.sh; do
  [[ -f "$f" ]] && copy_file "$f" "$TARGET/.claude/hooks/$(basename "$f")"
done

# Skills
echo ""
echo "--- Skills ---"
for d in "$SUITE_DIR/skills/"*/; do
  [[ -d "$d" ]] && copy_dir "$d" "$TARGET/.claude/skills/$(basename "$d")"
done

# Playbooks
echo ""
echo "--- Playbooks ---"
mkdir -p "$TARGET/.claude/social-media/playbooks" 2>/dev/null || true
for f in "$SUITE_DIR/playbooks/"*.md; do
  [[ -f "$f" ]] && copy_file "$f" "$TARGET/.claude/social-media/playbooks/$(basename "$f")"
done

# Scripts
echo ""
echo "--- Scripts ---"
for f in "$SUITE_DIR/scripts/"*.sh; do
  [[ -f "$f" ]] && copy_file "$f" "$TARGET/scripts/$(basename "$f")"
done

# Templates
echo ""
echo "--- Data Templates ---"
for f in "$SUITE_DIR/templates/"*.md; do
  [[ -f "$f" ]] && copy_file "$f" "$TARGET/social/$(basename "$f")"
done

# Brand guidelines template
echo ""
echo "--- Brand Guidelines Template ---"
if [[ ! -f "$TARGET/.claude/social-media/brand-guidelines.md" ]]; then
  copy_file "$SUITE_DIR/brand-guidelines-template.md" "$TARGET/.claude/social-media/brand-guidelines.md"
else
  echo "[install] SKIP — brand-guidelines.md already exists (not overwriting)"
fi

echo ""
echo "============================================"
echo "Installation complete! Files copied."
echo ""
echo "============================================"
echo "  NEXT STEP: Run /social-setup in Claude Code"
echo "============================================"
echo ""
echo "The setup wizard will:"
echo "  - Configure your brand voice and content pillars"
echo "  - Set up your platform accounts"
echo "  - Wire hooks into settings.json"
echo "  - Configure posting infrastructure"
echo "  - Verify everything works"
echo ""
echo "Just open Claude Code in your project and type: /social-setup"
echo "============================================"
