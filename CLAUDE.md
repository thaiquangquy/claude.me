# For technical explanations:
1. Start with a TL;DR of max 5 lines.
2. Show structure as a diagram (flow, sequence, or C4).
3. Use tables for comparisons and tradeoffs.
4. Write prose only for what a diagram cannot show.

# Plan output format

When running in plan mode, structure every plan using
exactly these sections in this order. Use markdown headers.
Keep each section tight — no filler prose.

## TL;DR
One or two sentences. What problem is being solved
and what the deliverable is.

## Constraints
Bullet list of what you will NOT change or touch.
Include files, APIs, patterns, dependencies.

## Steps
Summarize steps by a diagram (flow, sequence, or C4). Following by detail using numbered list. Each item must have:
  - one action verb (Create / Modify / Delete / Move)
  - one specific file or function name
  - one short outcome phrase
No sub-steps. No prose. Max 10 items.
If more than 10 steps are needed, split into phases
and label them Phase 1 / Phase 2.

## Risks
Bullet list for each uncertainty,
assumption, or potential side effect. If none, write "None."

## Questions
Numbered list. Only include genuine blockers.
Each question must include a default in parentheses:
1. Question text (default: your assumed answer)
If no questions, write "None."

## Files
A bullet list with one file per bullet, so that each file renders on its own line.
Each bullet is a prefix and then the path: A = add, M = modify, D = delete.
Example:
- A src/new_file.ts
- M src/existing.ts
- D src/old_file.ts

# Git push and pull requests
- Push and create PRs through the GitHub CLI (`gh`), never over SSH. SSH is for my own use only.
- Push over HTTPS with gh's credentials, without changing the repo's git config:
  `git -c credential.helper= -c credential.helper='!gh auth git-credential' push https://github.com/<owner>/<repo>.git <branch>`
  (take `<owner>/<repo>` from `git remote get-url origin`).
- Create PRs with `gh pr create`.
- After an HTTPS push, sync the tracking ref: `git update-ref refs/remotes/origin/<branch> <sha>`.
- Fetch the same way when needed (`git -c credential.helper='!gh auth git-credential' fetch https://github.com/<owner>/<repo>.git`); do not use the SSH `origin` URL.

# Publishing a mod (plugin directory validation)

Every plugin under `mods/` must pass the plugin directory's checks before release. Build these in from the start, not at publish time:

- **License**: the repo-root `LICENSE` (MIT) covers every plugin in a sub-folder; also set `"license": "MIT"` (an SPDX id) in the plugin's `.claude-plugin/plugin.json`.
- **Icon**: a square PNG at `.claude-plugin/icon.png`, set as `"icon": "./.claude-plugin/icon.png"`. PNG or JPEG only (no SVG, no WebP), 512 to 2048 px on each side, under 2 MB. It becomes the listing icon only the first time the plugin is saved or submitted in the developer portal; changing it later does nothing, so get it right before that first save.
- **Listing URLs** in `plugin.json` (each `https://`): `homepage` (`…/tree/master/mods/<name>`), `repository` (the repo), `documentationUrl` (`…/blob/master/mods/<name>/README.md`), `supportUrl` (`…/issues`), `privacyPolicyUrl` and `termsOfServiceUrl` (`…/blob/master/mods/<name>/PRIVACY.md` and `TERMS.md`). Write `PRIVACY.md` (what is collected, read locally, sent over the network, stored; contact) and `TERMS.md` (license, no warranty, not affiliated with Anthropic, support) in the mod folder, and push them before submitting so the URLs resolve. `classification` is filled in by the directory after submission; leave it out.
- **Manifest fields**: only fields Claude Code knows. Known conflict: the directory flags `types` as unknown, though the [manifest reference](https://code.claude.com/docs/en/plugins-reference) documents it and `claude plugin validate` fails without it for any mod that uses `$.state` (atoms), because the engine needs it to find the `PluginState` contract. Keep `types` in that case and accept the directory notice; leave it out only for a mod with no `$.state` and no `engine.create` nouns.
- **Program calls**: write every `$.process.run` command as one literal argv array (`['git', '-C', dir, 'diff', 'HEAD', '--numstat']`), never assembled from a helper or a spread of variable args. Only a value such as a path may be a variable.
- **README "What it runs and sends" section**, kept in step with the code:
  - which programs the mod runs, each command word for word, and why;
  - what data the mod sends and where; if nothing leaves the machine, say so plainly;
  - for any way out the directory does not know (a custom engine call, a network request), what that call does;
  - what it reads locally (session data, env vars, files) and why.
- **Before release**: `claude plugin validate mods/<name>` with no warnings and `claude plugin test mods/<name>` passing; bump `version`.

See `mods/pace-line` for a mod that meets all of these.
