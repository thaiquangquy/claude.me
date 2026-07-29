# Testing install.sh

This test suite runs `install.sh` against disposable fixture `HOME` directories,
never against your real `~/.claude/`. It works by overriding `$HOME` for each
run, since `install.sh` derives `CLAUDE_DIR` from `$HOME/.claude`.

Two ways to use it:
- **Automated**: `tests/run.sh` runs a fixed set of scenarios and asserts on
  the result.
- **Manual**: `tests/fixtures/make-fixture.sh` builds a fixture you can point
  `install.sh` at yourself and eyeball.

Requires only `bash` and `python3` (both used by the pty-driven conflict
tests) — no bats/expect/shellcheck needed.

## Automated tests

Run the whole suite:

```bash
bash tests/run.sh
```

This wipes `tests/work/` (scratch space for fixtures), runs every script in
`tests/cases/` in order, and prints a pass/fail summary. Exits non-zero if
anything failed.

Run a single case directly (useful while iterating):

```bash
bash tests/cases/05_conflict_override.sh
```

### What's covered

| Case | Scenario |
|---|---|
| `01_clean_install` | Empty `.claude/` — every file in `install.sh`'s `FILES` map becomes a correct symlink |
| `02_idempotent_relink` | Re-running against an already-linked `.claude/` — hits `[up-to-date]`, no prompts |
| `03_identical_content_overwrite` | A plain file that's byte-identical to the repo's — silently symlinked, no prompt |
| `04_conflict_skip` | Real conflict, answer `s` — file left untouched, no backup |
| `05_conflict_override` | Real conflict, answer `o` — backup taken, file replaced with a symlink |
| `06_conflict_append` | Real conflict, answer `a` — backup taken, repo content appended to the local file |
| `07_noninteractive_default_skip` | Conflict with stdin redirected from `/dev/null` — defaults to skip automatically, doesn't hang |
| `08_files_manifest_dirs_match` | Static check (no fixture): every `skills/<name>/SKILL.md` entry in the `FILES` map has a matching `mkdir -p` line, and vice versa |

### Debugging a failing case

By default, a case's fixture directory is deleted if it passes and **kept**
(with its path printed) if it fails, so you can inspect it after the fact:

```
KEPT FOR INSPECTION: tests/work/home.aB3dKq
```

Set `KEEP_FIXTURES=1` to keep every fixture regardless of pass/fail:

```bash
KEEP_FIXTURES=1 bash tests/cases/06_conflict_append.sh
ls tests/work/
```

`tests/work/` is gitignored and safe to delete at any time (`rm -rf tests/work`).

## Manual testing, step by step

Use this when you want to actually watch `install.sh` run interactively and
see the prompts, backups, and messages for yourself.

1. Build the fixture (safe to re-run any time — it wipes and rebuilds its
   target):

   ```bash
   bash tests/fixtures/make-fixture.sh
   ```

   This creates `tests/fixtures/home/.claude/` pre-seeded with one of each
   interesting state:
   - `CLAUDE.md` — different content than the repo's → triggers a real
     conflict prompt
   - `statusline.sh` — byte-identical to the repo's → silently symlinked,
     no prompt
   - `skills/blind-spot-pass/SKILL.md` — already a real symlink into this
     repo → reports `[up-to-date]`
   - everything else (`settings.json`, the remaining skills) is absent →
     reports `[linked]`

2. Run `install.sh` against it:

   ```bash
   HOME=tests/fixtures/home bash install.sh
   ```

3. When you hit the `CONFLICT: CLAUDE.md` prompt, try each answer on
   different runs to see the effect:
   - `s` — skip, file untouched
   - `o` — override, file backed up then replaced with a symlink
   - `a` — append, file backed up then repo content appended to the end

4. Inspect the result:

   ```bash
   ls -la tests/fixtures/home/.claude/
   cat tests/fixtures/home/.claude/CLAUDE.md
   ls tests/fixtures/home/.claude/backups/
   ```

5. Reset and repeat by re-running `make-fixture.sh` (step 1) — or build a
   fixture at a custom path:

   ```bash
   bash tests/fixtures/make-fixture.sh /tmp/my-fixture
   HOME=/tmp/my-fixture bash install.sh
   ```

`tests/fixtures/home/` is gitignored; delete it any time with
`rm -rf tests/fixtures/home`.

## Layout

```
tests/
  run.sh                  entry point for the automated suite
  lib/
    harness.sh             fixture + assertion helpers, sourced by each case
    pty_run.py              drives the interactive conflict prompt through a real pty
  cases/
    NN_*.sh                 one scenario per file, run in lexical order
  fixtures/
    make-fixture.sh          builds tests/fixtures/home/ for manual testing
    home/                    generated, gitignored — created by make-fixture.sh
  work/                      generated, gitignored — scratch fixtures for tests/run.sh
```

## Why a pty is needed for conflict tests

`install.sh`'s conflict prompt reads the answer from `/dev/tty` explicitly
(not stdin) and checks `[ -t 0 ]` to decide whether it's interactive at all.
Piping input via stdin doesn't reach the prompt and also trips the
non-interactive path. `tests/lib/pty_run.py` allocates a real pseudo-terminal
via Python's stdlib `pty` module, watches the child's output until the
prompt text actually appears, then sends a single keystroke — avoiding any
fixed-delay guessing, which would be flaky since `install.sh` iterates a
bash associative array in undefined order.
