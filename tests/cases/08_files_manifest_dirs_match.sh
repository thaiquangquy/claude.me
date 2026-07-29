#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/harness.sh"

# Static check, no fixture and no install.sh execution: every
# skills/<name>/SKILL.md key in install.sh's FILES map must have a
# matching `mkdir -p .../skills/<name>` line, in both directions. Guards
# against the two lists drifting apart when a skill is added or removed.

install_sh="$ROOT_DIR/install.sh"

files_map_dirs="$(grep -oE '"skills/[^/]+/SKILL\.md"' "$install_sh" \
  | sed -E 's#"skills/([^/]+)/SKILL\.md"#\1#' | sort -u)"

mkdir_dirs="$(grep -oE 'mkdir -p "\$CLAUDE_DIR/skills/[^"]+"' "$install_sh" \
  | sed -E 's#.*skills/([^"]+)".*#\1#' | sort -u)"

missing_mkdir="$(comm -23 <(echo "$files_map_dirs") <(echo "$mkdir_dirs"))"
extra_mkdir="$(comm -13 <(echo "$files_map_dirs") <(echo "$mkdir_dirs"))"

if [ -z "$missing_mkdir" ]; then
  ok "every FILES skill entry has a matching mkdir -p line"
else
  not_ok "every FILES skill entry has a matching mkdir -p line" "missing mkdir for: $missing_mkdir"
fi

if [ -z "$extra_mkdir" ]; then
  ok "every mkdir -p skills line has a matching FILES entry"
else
  not_ok "every mkdir -p skills line has a matching FILES entry" "no FILES entry for: $extra_mkdir"
fi

[ "$FAIL_COUNT" -eq 0 ]
