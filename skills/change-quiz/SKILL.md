---
name: change-quiz
description: This skill should be used when the user wants to verify their own understanding of a change by reading a report and passing a quiz on it — e.g. "give me an HTML report on the changes for me to read and understand with context, intuition, what was done, etc. and a quiz at the bottom on the changes that I must pass." Produces a self-contained HTML report plus a self-graded quiz, not just a summary.
---

# Change Quiz

Build a report the user can actually learn from, then test that
understanding — not just a change summary.

## Steps

1. **Gather the change set**: diff against the base branch, or everything
   changed this session.

2. **Build a single self-contained HTML report** (via the Artifact tool)
   organized by file/area, covering for each: what changed, why (the real
   motivation/context, not a restatement of the diff), and the intuition
   behind any non-obvious decision.

3. **Append a quiz section at the bottom** with several questions that can
   only be answered correctly by having understood the changes — not
   trivia answerable by pattern-matching the diff, not yes/no questions.

4. **Make the quiz self-graded but not skippable at a glance**: hide
   answers behind a disclosure (e.g. `<details>`) so the user attempts each
   question before revealing the answer, rather than seeing answers
   inline.
