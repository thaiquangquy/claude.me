#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/harness.sh"

home="$(new_fixture_home)"
mkdir -p "$home/.claude"
local_content="# local settings, not from repo
this is deliberately different from the repo's settings.json
"
printf '%s' "$local_content" > "$home/.claude/settings.json"

run_install_pty "$home" "Conflict:" "o"

assert_exit_code 0 "$INSTALL_EXIT" "install.sh exits 0 after override"
assert_contains "$INSTALL_OUTPUT" "[backup] settings.json ->" "output reports backup"
assert_contains "$INSTALL_OUTPUT" "[override] settings.json" "output reports [override]"
assert_symlink_to_repo "$home/.claude/settings.json" "settings.json" "settings.json becomes a symlink to repo"

backup="$(find_backup_file "$home" "settings.json")"
if [ -n "$backup" ] && cmp -s "$backup" <(printf '%s' "$local_content"); then
  ok "backup contains pre-override local content"
else
  not_ok "backup contains pre-override local content" "backup missing or content mismatch"
fi

finish_case "$home"
