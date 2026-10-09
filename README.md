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
| `skills/blind-spot-pass/SKILL.md` | `~/.claude/skills/blind-spot-pass/SKILL.md` | `/blind-spot-pass` skill — surfaces unknown unknowns in an unfamiliar domain/module before you start prompting about it |
| `skills/brainstorm-and-prototype/SKILL.md` | `~/.claude/skills/brainstorm-and-prototype/SKILL.md` | `/brainstorm-and-prototype` skill — disposable HTML mockups or ranked option lists to react to before committing to a direction |
| `skills/interview-me/SKILL.md` | `~/.claude/skills/interview-me/SKILL.md` | `/interview-me` skill — asks one ranked, architecture-relevant question at a time before implementation |
| `skills/reference-reimplement/SKILL.md` | `~/.claude/skills/reference-reimplement/SKILL.md` | `/reference-reimplement` skill — ports semantics (not syntax) from a reference implementation into the target codebase/language |
| `skills/implementation-plan/SKILL.md` | `~/.claude/skills/implementation-plan/SKILL.md` | `/implementation-plan` skill — HTML plan doc ordered by decision-likely-to-change first, mechanical work last |
| `skills/implementation-notes/SKILL.md` | `~/.claude/skills/implementation-notes/SKILL.md` | `/implementation-notes` skill — keeps a running implementation-notes.md, defaulting to conservative choices on deviations |
| `skills/pitch-doc/SKILL.md` | `~/.claude/skills/pitch-doc/SKILL.md` | `/pitch-doc` skill — packages a session's prototype/spec/notes into a demo-first doc for buy-in |
| `skills/change-quiz/SKILL.md` | `~/.claude/skills/change-quiz/SKILL.md` | `/change-quiz` skill — HTML change report plus a self-graded quiz to verify understanding |
| `skills/add-best-practice/SKILL.md` | `~/.claude/skills/add-best-practice/SKILL.md` | `/add-best-practice` skill — files a Java best practice noticed in any project into the `java-tutorial` repo's best_practices section and commits/pushes it there |

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

## pace-line mod

`mods/pace-line/` is a Claude Code mod (a plugin of function hooks) that draws the same two lines as `statusline.sh`, as a band above the prompt, with no `jq` or shell script needed:

```
Opus 5.5 (200K) high |  claude.me (master) 2f +10 -3
████░░░░░░ 42% 200K  |  5h 35% ⇣15% 2h  7d 80% ⇡9% 2d
```

- Line 1: model (context window), effort, project (branch), changed files `+added -deleted`
- Line 2: context bar (green < 70% ≤ yellow < 90% ≤ red), 5-hour and 7-day usage, pace vs. an even burn (`⇡` over, `⇣` under), time to reset. Without rate-limit data it shows `--` and the session cost.

Install it from a terminal session:

```
/plugin install pace-line --marketplace thaiquangquy/claude.me
```

Answer `y` to add the marketplace, then pick a scope. If you also use `statusline.sh`, remove the `statusLine` block from `~/.claude/settings.json` to avoid showing the same info twice.

Develop it locally with `claude --plugin-dir mods/pace-line`; check it with `claude plugin validate mods/pace-line` and `claude plugin test mods/pace-line`.

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
