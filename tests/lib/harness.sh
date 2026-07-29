#!/usr/bin/env bash
# Shared helpers for install.sh test cases. Sourced, not executed.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK_DIR="$ROOT_DIR/tests/work"

PASS_COUNT=0
FAIL_COUNT=0

mkdir -p "$WORK_DIR"

new_fixture_home() {
  mktemp -d "$WORK_DIR/home.XXXXXX"
}

# Refuses to run install.sh against anything outside the test tree, so a
# typo in a case script can never touch the real ~/.claude.
_require_test_path() {
  local path
  path="$(cd "$1" 2>/dev/null && pwd)" || { echo "not a directory: $1" >&2; exit 1; }
  case "$path" in
    "$WORK_DIR"/*|"$ROOT_DIR/tests/fixtures/"*) return 0 ;;
    *) echo "refusing to operate outside tests/work or tests/fixtures: $path" >&2; exit 1 ;;
  esac
}

run_install() {
  local home_dir="$1"
  _require_test_path "$home_dir"
  set +e
  INSTALL_OUTPUT="$(HOME="$home_dir" bash "$ROOT_DIR/install.sh" 2>&1)"
  INSTALL_EXIT=$?
  set -e
}

# </dev/null guarantees `[ -t 0 ]` is false for this invocation, regardless
# of whether the test suite itself is running from an interactive terminal.
run_install_noninteractive() {
  local home_dir="$1"
  _require_test_path "$home_dir"
  set +e
  INSTALL_OUTPUT="$(HOME="$home_dir" timeout 15 bash "$ROOT_DIR/install.sh" </dev/null 2>&1)"
  INSTALL_EXIT=$?
  set -e
}

# Drives a single conflict prompt through a real pty (needed because
# install.sh reads the answer from /dev/tty, not stdin).
run_install_pty() {
  local home_dir="$1" wait_marker="$2" send_char="$3"
  _require_test_path "$home_dir"
  set +e
  INSTALL_OUTPUT="$(python3 "$ROOT_DIR/tests/lib/pty_run.py" \
    --home "$home_dir" --install "$ROOT_DIR/install.sh" \
    --wait "$wait_marker" --send "$send_char")"
  INSTALL_EXIT=$?
  set -e
}

ok() {
  echo "ok - $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

not_ok() {
  echo "not ok - $1"
  if [ -n "${2:-}" ]; then
    echo "    $2"
  fi
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

assert_exit_code() {
  local expected="$1" actual="$2" desc="$3"
  if [ "$actual" = "$expected" ]; then
    ok "$desc"
  else
    not_ok "$desc" "expected exit $expected, got $actual"
  fi
}

assert_symlink_to_repo() {
  local path="$1" repo_rel="$2" desc="$3"
  local expected="$ROOT_DIR/$repo_rel"
  if [ ! -L "$path" ]; then
    not_ok "$desc" "$path is not a symlink"
    return
  fi
  local target
  target="$(readlink -f "$path")"
  if [ "$target" = "$(readlink -f "$expected")" ]; then
    ok "$desc"
  else
    not_ok "$desc" "symlink target $target != expected $(readlink -f "$expected")"
  fi
}

assert_regular_file() {
  local path="$1" desc="$2"
  if [ -f "$path" ] && [ ! -L "$path" ]; then
    ok "$desc"
  else
    not_ok "$desc" "$path is not a plain regular file"
  fi
}

assert_contains() {
  local haystack="$1" needle="$2" desc="$3"
  if [[ "$haystack" == *"$needle"* ]]; then
    ok "$desc"
  else
    not_ok "$desc" "expected to find: $needle"
  fi
}

assert_not_contains() {
  local haystack="$1" needle="$2" desc="$3"
  if [[ "$haystack" != *"$needle"* ]]; then
    ok "$desc"
  else
    not_ok "$desc" "did not expect to find: $needle"
  fi
}

assert_count() {
  local haystack="$1" needle="$2" expected="$3" desc="$4"
  local actual
  actual="$(grep -o -F "$needle" <<<"$haystack" | wc -l)"
  if [ "$actual" -eq "$expected" ]; then
    ok "$desc"
  else
    not_ok "$desc" "expected $expected occurrences of '$needle', got $actual"
  fi
}

assert_path_missing() {
  local path="$1" desc="$2"
  if [ ! -e "$path" ]; then
    ok "$desc"
  else
    not_ok "$desc" "$path unexpectedly exists"
  fi
}

# Echoes the path of the single backup file matching $2 under $1/.claude/backups
find_backup_file() {
  find "$1/.claude/backups" -type f -name "$2" 2>/dev/null | head -n1
}

# Removes the fixture on success, leaves it in place (and prints its path)
# on failure. Set KEEP_FIXTURES=1 to always keep it. Script exit code
# reflects whether every assertion in the case passed.
finish_case() {
  local home_dir="$1"
  if [ -n "${KEEP_FIXTURES:-}" ]; then
    echo "KEPT (KEEP_FIXTURES=1): $home_dir"
  elif [ "$FAIL_COUNT" -eq 0 ]; then
    rm -rf "$home_dir"
  else
    echo "KEPT FOR INSPECTION: $home_dir"
  fi
  [ "$FAIL_COUNT" -eq 0 ]
}
