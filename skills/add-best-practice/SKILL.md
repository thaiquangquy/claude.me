---
name: add-best-practice
description: This skill should be used when the user asks to save, note, or add a new Java best practice or pattern to their java-tutorial repo — e.g. "add this as a best practice", "note this pattern for my Java best practices", "save this to java-tutorial's best practices and commit it" — typically said while working in a completely different project/session. It records the practice in java-tutorial's best_practices section (README table, plus a runnable example when warranted) and commits — and pushes — that change inside the java-tutorial repo itself, without touching the git state of whatever project the current session is actually in.
---

# Add Best Practice

Capture a Java best practice discovered while working on an unrelated
project, and file it into `java-tutorial` — a *different* repo from the one
the current session is working in — then commit (and push) it there.

## Steps

1. **Locate the `java-tutorial` repo.** Default path:
   `~/workspace/quy/java-tutorial`. If it's not there, search shallowly
   (`find ~/workspace ~/ -maxdepth 4 -iname java-tutorial -type d 2>/dev/null`).
   If still not found, offer to clone it
   (`gh repo clone thaiquangquy/java-tutorial ~/workspace/quy/java-tutorial`)
   rather than guessing a path. Do all following git/file operations against
   this repo path explicitly (`git -C <repo>`, absolute file paths) — never
   `cd` the session into it, since the current project's terminal state
   shouldn't be disturbed.

2. **Read the existing section** at
   `java-language/src/best_practices/README.md` inside that repo to see the
   current categories and table format (`| Practice | Why it matters |
   Example |`, plus the separate SOLID table). Match this exact style —
   don't invent a new format.

3. **Extract the practice from context.** Use the code/pattern just discussed
   in the current conversation, or ask the user directly if the rule and its
   rationale aren't already clear: what's the rule, why does it matter, and
   is there a concrete snippet worth keeping as a runnable example. Don't
   guess at a rationale that wasn't stated or shown.

4. **Pick a category.** Match an existing section (Object Design; Null &
   Optional Handling; Resource & Exception Handling; Collections &
   Generics; Text Processing; Concurrency; Naming & Style; SOLID Principles)
   if the practice fits one. Otherwise add a new `### **<Category>**` section
   using the same table format, in a sensible position among the others.

5. **Add a runnable example only if there's a concrete snippet worth
   keeping** (not for a one-line naming/style rule). Follow the repo's
   existing convention:
   - New folder `java-language/src/best_practices/<topic_snake_case>/`.
   - `package best_practices.<topic_snake_case>;` in every file.
   - A `Demo.java` with a `main` method that actually exercises the
     behavior being taught (not a no-op) — see any existing
     `best_practices/*/Demo.java` for the pattern.
   - **Compile and run it before committing** — from the repo's
     `java-language` directory:
     `javac -d /tmp/<scratch-dir> src/best_practices/<topic>/*.java && java -cp /tmp/<scratch-dir> best_practices.<topic>.Demo`.
     Never commit example code that hasn't been verified to compile and run
     correctly. Clean up the scratch build dir afterward.

6. **Insert the new row** into the chosen table in `README.md`, linking the
   `Example` column to the new `Demo.java` (or `TopicClass.java`) when one
   was added, or `—` when not.

7. **Review before committing**: `git -C <repo> status` and
   `git -C <repo> diff` on just the touched files. Stage only the specific
   files that changed (the README and any new example files) — never `-A`
   or `.`.

8. **Commit** with a short, conventional message, e.g.
   `docs(best_practices): add practice on <topic>`, via a HEREDOC so
   formatting survives. Standard git safety rules apply: new commit (never
   amend), no `--no-verify` unless the user explicitly asks.

9. **Push** (`git -C <repo> push`, or `-u origin HEAD` if the branch has no
   upstream yet). This repo is the user's personal notes/reference repo and
   the entire point of this skill is to sync the practice elsewhere, so push
   directly without a separate confirmation step — same spirit as the
   `commit-and-push` skill.

10. **Report back** concisely: which category/row was added, whether an
    example was added and where, and that it was committed and pushed —
    making clear this happened in `java-tutorial`, not in the project the
    current session is actually working on.
