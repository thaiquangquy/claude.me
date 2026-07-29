#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/harness.sh"

home="$(new_fixture_home)"
run_install "$home"  # first run: bring to fully-linked state
first_targets="$(find "$home/.claude" -type l -exec readlink -f {} \; | sort)"

run_install "$home"  # second run: should be idempotent, no prompts

assert_exit_code 0 "$INSTALL_EXIT" "second install.sh run exits 0"
assert_count "$INSTALL_OUTPUT" "[up-to-date]" 14 "second run reports 14 [up-to-date] entries"
assert_not_contains "$INSTALL_OUTPUT" "[linked]" "second run does not re-link anything"
assert_not_contains "$INSTALL_OUTPUT" "CONFLICT" "second run has no conflicts"

second_targets="$(find "$home/.claude" -type l -exec readlink -f {} \; | sort)"
if [ "$first_targets" = "$second_targets" ]; then
  ok "symlink targets unchanged across re-run"
else
  not_ok "symlink targets unchanged across re-run" "targets differ between runs"
fi

assert_path_missing "$home/.claude/backups" "no backups created by idempotent re-run"

finish_case "$home"
