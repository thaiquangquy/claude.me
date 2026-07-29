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

run_install_noninteractive "$home"

assert_exit_code 0 "$INSTALL_EXIT" "install.sh exits 0 in non-interactive mode"
assert_contains "$INSTALL_OUTPUT" "[non-interactive] defaulting to skip" "output reports non-interactive default"
assert_contains "$INSTALL_OUTPUT" "[skipped] settings.json" "output reports [skipped]"

if cmp -s "$home/.claude/settings.json" <(printf '%s' "$local_content"); then
  ok "settings.json content is unchanged"
else
  not_ok "settings.json content is unchanged" "content was modified"
fi

assert_path_missing "$home/.claude/backups" "no backup created in non-interactive mode"

finish_case "$home"
