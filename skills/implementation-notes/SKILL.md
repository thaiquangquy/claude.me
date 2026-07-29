---
name: implementation-notes
description: This skill should be used when the user wants Claude to keep a running implementation-notes.md log during a multi-step implementation and default to conservative choices on edge cases instead of stopping to ask — e.g. "keep an implementation-notes.md file. If you hit an edge case that forces you to deviate from the plan, pick the conservative option, log it under 'Deviations', and keep going."
---

# Implementation Notes

Keep an audit trail during implementation and default to the safe choice on
edge cases rather than interrupting the user for every one.

## Steps

1. **Create or open `implementation-notes.md`** (next to the plan doc, or
   at the repo root if there is no plan doc) at the start of the work.

2. **When an edge case forces a deviation from the plan**, default to the
   conservative option — favoring reversibility and least surprise — rather
   than pausing to ask, unless the deviation is genuinely high-stakes or
   irreversible (in which case, stop and ask).

3. **Log every deviation** under a `## Deviations` section: what forced it,
   what was chosen, and why it's the conservative option. Keep entries
   short — this is a log, not a essay.

4. **Keep going.** The point of this habit is uninterrupted forward
   progress with a trail the user can audit afterward, not a
   decision-by-decision check-in.
