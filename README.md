# claude.me

Portable Claude Code configuration — global CLAUDE.md, settings, statusline, and custom skills. Use this repo to bootstrap or sync your Claude Code environment on any machine.

## What's inside

| File | Destination | Purpose |
|------|-------------|---------|
| `CLAUDE.md` | `~/.claude/CLAUDE.md` | Global instructions for Claude (plan format, preferences) |
| `settings.json` | `~/.claude/settings.json` | Theme, statusline command, marketplace registrations |
| `statusline.sh` | `~/.claude/statusline.sh` | Custom statusline: model, context %, git info, rate limits |
| `skills/sync-claude.md` | `~/.claude/skills/sync-claude.md` | `/sync-claude` skill to pull & reinstall |
| `skills/commit-and-push/SKILL.md` | `~/.claude/skills/commit-and-push/SKILL.md` | `/commit-and-push` skill with conventional commits and PR link |
| `skills/create-readme/SKILL.md` | `~/.claude/skills/create-readme/SKILL.md` | `/create-readme` skill — generates README.md (banesullivan template) plus a companion DEVELOPMENT.md for dev/contributor instructions, from evidenced project facts |

## Marketplace

This repo doubles as a Claude Code plugin marketplace (`thaiquangquy-skills`). The `settings.json` installed by this repo already registers the marketplace. On any machine after running `install.sh`, install the skill bundle with:

```
/plugin install personal-skills@thaiquangquy-skills
```

To register the marketplace manually (if you manage `settings.json` separately), add to `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "thaiquangquy-skills": {
      "source": {
        "source": "github",
        "repo": "thaiquangquy/claude.me"
      }
    }
  }
}
```

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
