---
name: commit-and-push
description: This skill should be used when the user says "commit and push to git", "commit and push", or asks to commit the current changes and push them up. It commits the pending changes with a brief, one-line commit message, pushes the current branch to its remote, and then surfaces the pull-request creation link returned in the git push output so the user can click straight through to open a PR.
---

# Commit and Push

Chain a commit and a push into one step, then recover the pull-request
creation URL that the git host prints in the push output (Bitbucket, GitHub,
and GitLab all do this for a branch that doesn't have an open PR yet) instead
of letting it scroll past unread.

## Steps

1. **Inspect the change set.** Run `git status` and `git diff` (staged and
   unstaged) in parallel, plus `git log -5 --oneline` to match the repo's
   commit message style. Skip everything below if the tree is clean — tell
   the user there is nothing to commit.

2. **Stage deliberately.** Add the specific files that changed by name. Don't
   use `git add -A` or `git add .`, and don't stage anything that looks like a
   secret (`.env`, credentials, keys).

3. **Write a brief, conventional commit message.** One short line describing
   the *why*, not a multi-paragraph body — the user explicitly asked for
   "brief." Build it as:
   ```
   <purpose>: [jira-id]<message>
   ```
   - `<purpose>` is a conventional-commit type inferred from the diff: `feat`,
     `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `perf`, `build`, or
     `ci`.
   - `<jira-id>` comes from the current branch name, not the message text.
     Run `git branch --show-current` and pull out a ticket pattern like
     `[A-Z][A-Z0-9]+-[0-9]+` (e.g. `dev-bot/SVC-2102-fix-review-tab` →
     `SVC-2102`). If the branch has no such pattern (e.g. `hotfix/DisableEvent`),
     drop the `[jira-id]` segment entirely rather than inventing one —
     don't ask the user to supply a ticket unless they bring it up.
   - `<message>` is the short description itself.

   Examples: `fix: [SVC-2102]Fix review tab available modes` or, with no
   ticket in the branch, `fix: Disable event on hotfix path`.

   Match the repo's existing style from `git log` where it doesn't conflict
   with this format. Commit with the message passed via a HEREDOC so
   formatting survives:
   ```bash
   git commit -m "$(cat <<'EOF'
   <purpose>: [jira-id]<message>
   EOF
   )"
   ```
   Follow standard git safety rules: create a new commit rather than amending,
   and never pass `--no-verify` unless the user explicitly asks for it. If a
   pre-commit hook fails, fix the issue and commit again rather than bypassing
   it.

4. **Push the current branch**, capturing full output (the PR link normally
   arrives on stderr, so don't discard it):
   ```bash
   git push 2>&1
   ```
   If the branch has no upstream yet, use `git push -u origin HEAD 2>&1`
   instead. Never force-push as part of this skill.

5. **Extract the PR creation link from that output.** Look for a `remote:`
   line containing one of these patterns:
   - Bitbucket: `pull-requests/new`
   - GitHub: `pull/new`
   - GitLab: `merge_requests/new`

6. **Report back to the user:**
   - If a link was found, give it to the user directly — that's the answer
     they asked for.
   - If no link appears (e.g. the branch already has upstream history or an
     open PR, so the host has nothing new to suggest), say so plainly. As a
     convenience, derive `origin`'s host/workspace/repo from
     `git remote get-url origin` and construct the host's standard
     "create PR" URL for the current branch (e.g. Bitbucket:
     `https://bitbucket.org/<workspace>/<repo>/pull-requests/new?source=<branch>&t=1`),
     but label it clearly as constructed, not one the push actually returned.

Never open the link or create the PR automatically — just hand the user the
URL so they can review the diff before opening it themselves.
