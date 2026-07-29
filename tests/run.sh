#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$ROOT_DIR/tests/work"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

total=0
failed=()

for case_script in "$ROOT_DIR"/tests/cases/*.sh; do
  name="$(basename "$case_script" .sh)"
  echo "=== $name ==="
  total=$((total + 1))
  if bash "$case_script"; then
    :
  else
    failed+=("$name")
  fi
  echo ""
done

echo "=================================="
echo "$((total - ${#failed[@]}))/$total cases passed"

if [ "${#failed[@]}" -gt 0 ]; then
  echo "FAILED: ${failed[*]}"
  exit 1
fi

echo "All tests passed."
