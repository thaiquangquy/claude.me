#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET="${1:-$ROOT_DIR/tests/fixtures/home}"

echo "==> Rebuilding fixture at $TARGET"
rm -rf "$TARGET"
mkdir -p "$TARGET/.claude/skills"

# CLAUDE.md: plain file, different content -> real conflict prompt (try s/o/a)
cat > "$TARGET/.claude/CLAUDE.md" <<'EOF'
# Local CLAUDE.md
This is deliberately different from the repo's CLAUDE.md, to trigger a
conflict prompt when you run install.sh against this fixture.
EOF

# statusline.sh: plain file, byte-identical to repo -> silent symlink overwrite
cp "$ROOT_DIR/statusline.sh" "$TARGET/.claude/statusline.sh"

# blind-spot-pass: already a real symlink into the actual repo -> [up-to-date]
mkdir -p "$TARGET/.claude/skills/blind-spot-pass"
ln -s "$ROOT_DIR/skills/blind-spot-pass/SKILL.md" \
  "$TARGET/.claude/skills/blind-spot-pass/SKILL.md"

# Everything else (settings.json, the remaining skills) is left absent, so
# a normal run shows the plain [linked] path for those.

echo "==> Fixture ready. Try it with:"
echo ""
echo "    HOME=$TARGET bash $ROOT_DIR/install.sh"
echo ""
echo "This directory is disposable and gitignored -- rm -rf it or re-run"
echo "this script any time to reset it."
