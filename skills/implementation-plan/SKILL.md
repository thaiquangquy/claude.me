---
name: implementation-plan
description: This skill should be used when the user wants a standalone implementation plan document (not Claude Code's built-in plan mode) that leads with the decisions most likely to change and buries mechanical work at the bottom — e.g. "write an implementation plan in HTML, but lead with the decisions I'm most likely to tweak: data model changes, new type interfaces, anything user-facing. Bury the mechanical refactoring at the bottom, I trust you on that part."
---

# Implementation Plan

Produce a plan document ordered by how likely each part is to change under
review, not by execution order.

## Steps

1. **Split the work into two buckets**:
   - **Decision-heavy**: data model changes, new type/interface definitions,
     user-facing behavior — anything with real probability of revision once
     the user sees it.
   - **Mechanical**: refactors, plumbing, boilerplate, wiring — low
     probability of revision, the kind of thing the user is comfortable
     trusting without deep review.

2. **Write a single self-contained HTML document** (via the Artifact tool)
   ordered highest-uncertainty-first:
   - Decision-heavy items first, each with the proposed choice, the
     alternatives considered, and why this one — this is what the user's
     attention should go to.
   - Mechanical items last, kept brief and explicitly flagged as
     "trust me on this part" so the user knows they don't need to scrutinize
     it line by line.

3. **Don't pad the mechanical section** to look thorough — brevity there is
   the point; it signals where the user's review time is and isn't needed.
