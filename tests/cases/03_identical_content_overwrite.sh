#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/harness.sh"

home="$(new_fixture_home)"
mkdir -p "$home/.claude"
cp "$ROOT_DIR/CLAUDE.md" "$home/.claude/CLAUDE.md"  # plain file, byte-identical to repo

run_install "$home"

assert_exit_code 0 "$INSTALL_EXIT" "install.sh exits 0"
assert_symlink_to_repo "$home/.claude/CLAUDE.md" "CLAUDE.md" "identical-content CLAUDE.md becomes a symlink"
assert_contains "$INSTALL_OUTPUT" "[linked] CLAUDE.md" "output reports [linked] for CLAUDE.md"
assert_not_contains "$INSTALL_OUTPUT" "CONFLICT: CLAUDE.md" "no conflict prompt for identical content"
assert_path_missing "$home/.claude/backups" "no backup created for identical-content overwrite"

finish_case "$home"
