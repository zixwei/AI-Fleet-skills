#!/bin/bash
set -e

# ── Config ───────────────────────────────────────────────────────────

REPO="https://github.com/Samin12/thumbnail-engine.git"
SKILL_NAME="youtube-thumbnail"

# ── Helpers ──────────────────────────────────────────────────────────

BOLD='\033[1m'
DIM='\033[2m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

info()  { echo -e "  ${GREEN}>${NC} $1"; }
warn()  { echo -e "  ${YELLOW}>${NC} $1"; }
fail()  { echo -e "  ${RED}x${NC} $1"; exit 1; }
step()  { echo -e "\n  ${BOLD}$1${NC}"; }

cleanup() {
  if [ -n "$TMPDIR_CREATED" ] && [ -d "$TMPDIR_CREATED" ]; then
    rm -rf "$TMPDIR_CREATED"
  fi
}
trap cleanup EXIT

TARGET_DIR="$(pwd)"

# Detect install vs update
if [ -d "$TARGET_DIR/.claude/skills/youtube-thumbnail" ]; then
  MODE="update"
else
  MODE="install"
fi

echo ""
echo -e "  ${WHITE}████████╗██╗  ██╗██╗   ██╗███╗   ███╗██████╗ ███╗   ██╗ █████╗ ██╗██╗     ${NC}"
echo -e "  ${WHITE}╚══██╔══╝██║  ██║██║   ██║████╗ ████║██╔══██╗████╗  ██║██╔══██╗██║██║     ${NC}"
echo -e "  ${WHITE}   ██║   ███████║██║   ██║██╔████╔██║██████╔╝██╔██╗ ██║███████║██║██║     ${NC}"
echo -e "  ${WHITE}   ██║   ██╔══██║██║   ██║██║╚██╔╝██║██╔══██╗██║╚██╗██║██╔══██║██║██║     ${NC}"
echo -e "  ${WHITE}   ██║   ██║  ██║╚██████╔╝██║ ╚═╝ ██║██████╔╝██║ ╚████║██║  ██║██║███████╗${NC}"
echo -e "  ${WHITE}   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝╚══════╝${NC}"
echo ""
echo -e "  ${RED}███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗${NC}"
echo -e "  ${RED}██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝${NC}"
echo -e "  ${RED}█████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗  ${NC}"
echo -e "  ${RED}██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝  ${NC}"
echo -e "  ${RED}███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗${NC}"
echo -e "  ${RED}╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝${NC}"
echo ""
if [ "$MODE" = "update" ]; then
  echo -e "  ${DIM}Updating to latest version${NC}"
else
  echo -e "  ${DIM}Installing skill + dependencies${NC}"
fi

# ── Resolve source ───────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" 2>/dev/null || echo ".")" && pwd)"

if [ -f "$SCRIPT_DIR/.claude/skills/$SKILL_NAME/SKILL.md" ]; then
  SOURCE_DIR="$SCRIPT_DIR"
else
  step "Fetching"
  TMPDIR_CREATED="$(mktemp -d)"
  git clone --depth 1 "$REPO" "$TMPDIR_CREATED" 2>/dev/null || fail "Clone failed. Do you have access to the repo?"
  SOURCE_DIR="$TMPDIR_CREATED"
  info "done"
fi

# ── Prerequisites ────────────────────────────────────────────────────

step "Prerequisites"

command -v python3 >/dev/null 2>&1 || fail "Python 3 is required — https://python.org"
PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)
if [ "$PYTHON_MAJOR" -lt 3 ] || { [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 10 ]; }; then
  fail "Python 3.10+ required (found $PYTHON_VERSION)"
fi
info "Python ${DIM}$PYTHON_VERSION${NC}"

# ── Install skill files ─────────────────────────────────────────────

if [ "$SOURCE_DIR" != "$TARGET_DIR" ]; then
  step "Installing"

  SKILL_DIR="$TARGET_DIR/.claude/skills/$SKILL_NAME"

  if [ -d "$SKILL_DIR" ]; then
    info "Updating existing skill"
    rm -rf "$SKILL_DIR"
  fi

  mkdir -p "$SKILL_DIR/scripts"
  mkdir -p "$SKILL_DIR/assets/headshots"

  cp "$SOURCE_DIR/.claude/skills/$SKILL_NAME/SKILL.md" "$SKILL_DIR/SKILL.md"
  cp "$SOURCE_DIR/.claude/skills/$SKILL_NAME/scripts/generate_thumbnail.py" "$SKILL_DIR/scripts/generate_thumbnail.py"
  cp "$SOURCE_DIR/.claude/skills/$SKILL_NAME/scripts/combine_thumbnails.py" "$SKILL_DIR/scripts/combine_thumbnails.py"
  cp "$SOURCE_DIR/.claude/skills/$SKILL_NAME/scripts/search_examples.py" "$SKILL_DIR/scripts/search_examples.py"
  cp "$SOURCE_DIR/.claude/skills/$SKILL_NAME/assets/headshots/README.md" "$SKILL_DIR/assets/headshots/README.md"
  info ".claude/skills/$SKILL_NAME/"

  # Template files (don't overwrite existing)
  if [ ! -f "$TARGET_DIR/.env.example" ]; then
    cp "$SOURCE_DIR/.env.example" "$TARGET_DIR/.env.example"
    info ".env.example"
  fi

  if [ ! -f "$TARGET_DIR/CLAUDE.md.example" ]; then
    cp "$SOURCE_DIR/CLAUDE.md.example" "$TARGET_DIR/CLAUDE.md.example"
    info "CLAUDE.md.example"
  fi

  # Merge or copy requirements.txt
  if [ -f "$TARGET_DIR/requirements.txt" ]; then
    while IFS= read -r pkg; do
      [ -z "$pkg" ] && continue
      [[ "$pkg" == \#* ]] && continue
      if ! grep -q "$pkg" "$TARGET_DIR/requirements.txt" 2>/dev/null; then
        echo "$pkg" >> "$TARGET_DIR/requirements.txt"
      fi
    done < "$SOURCE_DIR/requirements.txt"
  else
    cp "$SOURCE_DIR/requirements.txt" "$TARGET_DIR/requirements.txt"
  fi
  info "requirements.txt"
fi

# ── Environment ──────────────────────────────────────────────────────

cd "$TARGET_DIR"

step "Environment"

if [ ! -f .env ]; then
  cp .env.example .env
  info "Created .env ${DIM}— API keys are optional (Higgsfield MCP is the primary engine)${NC}"
else
  info ".env ${DIM}ready${NC}"
fi

# ── Python ───────────────────────────────────────────────────────────

step "Python"

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt
info "Packages installed"

# ── Done ─────────────────────────────────────────────────────────────

echo ""
echo ""
if [ "$MODE" = "update" ]; then
  echo -e "  ${GREEN}${BOLD}Updated!${NC}"
  echo ""
  echo -e "  ${DIM}Restart Claude Code to pick up changes.${NC}"
else
  echo -e "  ${GREEN}${BOLD}Installed!${NC}"
  echo ""
  echo -e "  ${DIM}1.${NC} Connect the Higgsfield MCP server to Claude Code:"
  echo -e "     ${DIM}https://higgsfield.ai — this is the image engine${NC}"
  echo ""
  echo -e "  ${DIM}2.${NC} Customize for your channel:"
  echo -e "     ${CYAN}cp CLAUDE.md.example CLAUDE.md${NC}"
  echo -e "     ${DIM}Edit with your name and style preferences${NC}"
  echo ""
  echo -e "  ${DIM}3.${NC} Add your headshot photos to:"
  echo -e "     ${CYAN}.claude/skills/youtube-thumbnail/assets/headshots/${NC}"
  echo ""
  echo -e "  ${DIM}4.${NC} Open Claude Code and run:"
  echo -e "     ${CYAN}/youtube-thumbnail${NC}"
  echo ""
  echo -e "  ${DIM}Optional: add GEMINI_API_KEY to .env for the non-Higgsfield fallback engine.${NC}"
fi
echo ""
