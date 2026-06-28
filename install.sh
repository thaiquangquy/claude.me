#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$CLAUDE_DIR/backups/claude-me-$(date +%Y%m%d-%H%M%S)"

# Files to symlink: repo-relative path -> ~/.claude/ destination
declare -A FILES=(
  ["CLAUDE.md"]="CLAUDE.md"
  ["settings.json"]="settings.json"
  ["statusline.sh"]="statusline.sh"
  ["skills/sync-claude.md"]="skills/sync-claude.md"
)

echo "==> Installing claude.me config from $REPO_DIR"

# WSL/Windows symlink warning
if grep -qi microsoft /proc/version 2>/dev/null; then
  echo "    [WSL detected] Symlinks require Developer Mode enabled in Windows."
  echo "    If install fails, enable: Settings > For Developers > Developer Mode"
fi

mkdir -p "$CLAUDE_DIR/skills"

for src_rel in "${!FILES[@]}"; do
  dst_rel="${FILES[$src_rel]}"
  src="$REPO_DIR/$src_rel"
  dst="$CLAUDE_DIR/$dst_rel"

  if [ ! -f "$src" ]; then
    echo "    [skip] $src_rel not found in repo"
    continue
  fi

  # Backup existing file (not if it's already our symlink)
  if [ -e "$dst" ] && [ ! -L "$dst" ]; then
    mkdir -p "$BACKUP_DIR"
    cp "$dst" "$BACKUP_DIR/$(basename "$dst")"
    echo "    [backup] $dst -> $BACKUP_DIR/$(basename "$dst")"
  fi

  ln -sf "$src" "$dst"
  echo "    [linked] $dst -> $src"
done

# Make statusline executable
chmod +x "$CLAUDE_DIR/statusline.sh" 2>/dev/null || true

echo "==> Done."
