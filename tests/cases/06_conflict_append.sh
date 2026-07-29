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

run_install_pty "$home" "Conflict:" "a"

assert_exit_code 0 "$INSTALL_EXIT" "install.sh exits 0 after append"
assert_contains "$INSTALL_OUTPUT" "[backup] settings.json ->" "output reports backup"
assert_contains "$INSTALL_OUTPUT" "[appended] settings.json" "output reports [appended]"
assert_contains "$INSTALL_OUTPUT" "run install again and choose [o]" "output warns about restoring auto-updates"
assert_regular_file "$home/.claude/settings.json" "settings.json remains a plain file"

if head -c "${#local_content}" "$home/.claude/settings.json" | cmp -s - <(printf '%s' "$local_content"); then
  ok "appended file still starts with original local content"
else
  not_ok "appended file still starts with original local content" "prefix mismatch"
fi

today="$(date +%Y-%m-%d)"
if grep -qF "# ── appended from claude.me ($today) ──" "$home/.claude/settings.json"; then
  ok "appended file contains the dated separator line"
else
  not_ok "appended file contains the dated separator line" "separator not found"
fi

repo_size=$(wc -c < "$ROOT_DIR/settings.json")
if tail -c "$repo_size" "$home/.claude/settings.json" | cmp -s - "$ROOT_DIR/settings.json"; then
  ok "repo settings.json content is appended verbatim at the end"
else
  not_ok "repo settings.json content is appended verbatim at the end" "tail bytes mismatch"
fi

backup="$(find_backup_file "$home" "settings.json")"
if [ -n "$backup" ] && cmp -s "$backup" <(printf '%s' "$local_content"); then
  ok "backup contains pre-append local content"
else
  not_ok "backup contains pre-append local content" "backup missing or content mismatch"
fi

finish_case "$home"
