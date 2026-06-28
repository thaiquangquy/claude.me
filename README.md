# claude.me

Portable Claude Code configuration — global CLAUDE.md, settings, statusline, and custom skills. Use this repo to bootstrap or sync your Claude Code environment on any machine.

## What's inside

| File | Destination | Purpose |
|------|-------------|---------|
| `CLAUDE.md` | `~/.claude/CLAUDE.md` | Global instructions for Claude (plan format, preferences) |
| `settings.json` | `~/.claude/settings.json` | Theme, statusline command, and other settings |
| `statusline.sh` | `~/.claude/statusline.sh` | Custom statusline: model, context %, git info, rate limits |
| `skills/sync-claude.md` | `~/.claude/skills/sync-claude.md` | `/sync-claude` skill to pull & reinstall |

## First-time setup (new machine)

```bash
git clone https://github.com/thaiquangquy/claude.me ~/claude.me
bash ~/claude.me/install.sh
```

`install.sh` creates symlinks from `~/.claude/` into this repo. Any pre-existing files are backed up to `~/.claude/backups/` before being replaced.

## Updating an existing machine

Inside Claude Code, run:

```
/sync-claude
```

Or manually:

```bash
cd ~/claude.me && git pull && bash install.sh
```

## Adding new config

1. Add the file to this repo (e.g. `skills/my-skill.md`)
2. Register it in the `FILES` map in `install.sh`
3. Commit and push
4. Run `/sync-claude` on all machines

## Editing config on a machine

Since `~/.claude/` files are symlinks back to this repo, edits take effect immediately. Remember to commit and push:

```bash
cd ~/claude.me
git add -p
git commit -m "update: <what changed>"
git push
```
