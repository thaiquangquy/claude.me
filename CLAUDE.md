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
