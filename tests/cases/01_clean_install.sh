#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/harness.sh"

# This list mirrors install.sh's FILES map. Case 08 separately checks the
# skills-directory subset for drift against install.sh's mkdir -p list.
FILES=(
  "CLAUDE.md:CLAUDE.md"
  "settings.json:settings.json"
  "statusline.sh:statusline.sh"
  "skills/sync-claude.md:skills/sync-claude.md"
  "skills/commit-and-push/SKILL.md:skills/commit-and-push/SKILL.md"
  "skills/create-readme/SKILL.md:skills/create-readme/SKILL.md"
  "skills/blind-spot-pass/SKILL.md:skills/blind-spot-pass/SKILL.md"
  "skills/brainstorm-and-prototype/SKILL.md:skills/brainstorm-and-prototype/SKILL.md"
  "skills/interview-me/SKILL.md:skills/interview-me/SKILL.md"
  "skills/reference-reimplement/SKILL.md:skills/reference-reimplement/SKILL.md"
  "skills/implementation-plan/SKILL.md:skills/implementation-plan/SKILL.md"
  "skills/implementation-notes/SKILL.md:skills/implementation-notes/SKILL.md"
  "skills/pitch-doc/SKILL.md:skills/pitch-doc/SKILL.md"
  "skills/change-quiz/SKILL.md:skills/change-quiz/SKILL.md"
)

home="$(new_fixture_home)"
run_install "$home"  # .claude/ does not exist yet

assert_exit_code 0 "$INSTALL_EXIT" "install.sh exits 0 on missing .claude/"

for entry in "${FILES[@]}"; do
  src_rel="${entry%%:*}"
  dst_rel="${entry##*:}"
  assert_symlink_to_repo "$home/.claude/$dst_rel" "$src_rel" "$dst_rel is symlinked to repo"
done

assert_count "$INSTALL_OUTPUT" "[linked]" 14 "output reports 14 [linked] entries"
assert_not_contains "$INSTALL_OUTPUT" "[up-to-date]" "no [up-to-date] entries on first install"
assert_not_contains "$INSTALL_OUTPUT" "CONFLICT" "no conflicts on first install"

# chmod +x follows the symlink and lands on the real repo's statusline.sh,
# not a fixture-local copy -- harmless since it's already executable, but
# this is why running the suite touches one real repo file's mode bit.
if [ -x "$home/.claude/statusline.sh" ]; then
  ok "statusline.sh is executable"
else
  not_ok "statusline.sh is executable"
fi

assert_path_missing "$home/.claude/backups" "no backups created on clean install"

finish_case "$home"
