#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$CLAUDE_DIR/backups/claude-me-$(date +%Y%m%d-%H%M%S)"

# Files to install: repo-relative path -> ~/.claude/ destination
declare -A FILES=(
  ["CLAUDE.md"]="CLAUDE.md"
  ["settings.json"]="settings.json"
  ["statusline.sh"]="statusline.sh"
  ["skills/sync-claude.md"]="skills/sync-claude.md"
  ["skills/commit-and-push/SKILL.md"]="skills/commit-and-push/SKILL.md"
  ["skills/create-readme/SKILL.md"]="skills/create-readme/SKILL.md"
)

echo "==> Installing claude.me config from $REPO_DIR"

# WSL/Windows symlink warning
if grep -qi microsoft /proc/version 2>/dev/null; then
  echo "    [WSL detected] Symlinks require Developer Mode enabled in Windows."
  echo "    If install fails, enable: Settings > For Developers > Developer Mode"
fi

mkdir -p "$CLAUDE_DIR/skills"
mkdir -p "$CLAUDE_DIR/skills/commit-and-push"
mkdir -p "$CLAUDE_DIR/skills/create-readme"

# Returns true if $1 is a symlink whose target lives inside $REPO_DIR
_is_our_symlink() {
  local path="$1"
  [ -L "$path" ] || return 1
  local target
  target="$(readlink -f "$path" 2>/dev/null)" || return 1
  [[ "$target" == "$REPO_DIR"/* ]]
}

# Prints a short unified diff (capped at 20 lines) between dst ($1) and src ($2)
_show_diff() {
  local dst="$1" src="$2"
  echo "    --- current: $dst"
  echo "    +++ repo:    $src"
  if command -v diff >/dev/null 2>&1; then
    diff --unified=2 "$dst" "$src" 2>/dev/null | head -n 20 | sed 's/^/    /' || true
  else
    echo "    (diff not available — current: $(wc -c <"$dst") bytes, repo: $(wc -c <"$src") bytes)"
  fi
}

# Prompts user for conflict resolution. Defaults to 's' (skip) when non-interactive.
# Echoes the chosen letter: s, o, or a
_prompt_conflict() {
  if [ ! -t 0 ]; then
    echo "    [non-interactive] defaulting to skip"
    echo "s"
    return
  fi
  local choice
  while true; do
    printf "    Conflict: [s]kip  [o]verride (symlink)  [a]ppend (keep local + add repo at end): "
    read -r -n 1 choice </dev/tty
    echo
    case "$choice" in
      s|S) echo "s"; return ;;
      o|O) echo "o"; return ;;
      a|A) echo "a"; return ;;
      *) echo "    Please enter s, o, or a." ;;
    esac
  done
}

# Backup $1 into $BACKUP_DIR
_backup() {
  mkdir -p "$BACKUP_DIR"
  cp "$1" "$BACKUP_DIR/$(basename "$1")"
  echo "    [backup] $(basename "$1") -> $BACKUP_DIR/"
}

# Bash associative arrays iterate in undefined order; that's fine here.
for src_rel in "${!FILES[@]}"; do
  dst_rel="${FILES[$src_rel]}"
  src="$REPO_DIR/$src_rel"
  dst="$CLAUDE_DIR/$dst_rel"

  if [ ! -f "$src" ]; then
    echo "    [skip] $src_rel not found in repo"
    continue
  fi

  # Already linked to our repo — git pull already updated the content
  if _is_our_symlink "$dst"; then
    echo "    [up-to-date] $dst_rel"
    continue
  fi

  # Destination doesn't exist, or it exists with identical content — just symlink
  if [ ! -e "$dst" ] || cmp -s "$src" "$dst"; then
    ln -sf "$src" "$dst"
    echo "    [linked] $dst_rel"
    continue
  fi

  # Destination exists with different content — show diff and prompt
  echo ""
  echo "  CONFLICT: $dst_rel"
  _show_diff "$dst" "$src"
  echo ""

  choice=$(_prompt_conflict)

  case "$choice" in
    s)
      echo "    [skipped] $dst_rel — left unchanged"
      ;;
    o)
      _backup "$dst"
      ln -sf "$src" "$dst"
      echo "    [override] $dst_rel — replaced with repo version (symlink)"
      ;;
    a)
      _backup "$dst"
      printf '\n\n# ── appended from claude.me (%s) ──\n' "$(date +%Y-%m-%d)" >> "$dst"
      cat "$src" >> "$dst"
      echo "    [appended] $dst_rel — repo content added at end of local file"
      echo "    [warning]  $dst_rel is now a plain file; run install again and choose [o] to restore auto-updates via git pull"
      ;;
  esac
  echo ""
done

# Make statusline executable
chmod +x "$CLAUDE_DIR/statusline.sh" 2>/dev/null || true

echo "==> Done."
