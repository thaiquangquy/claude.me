---
name: blind-spot-pass
description: This skill should be used when the user is about to work on something they have little context on and asks Claude to help find their "unknown unknowns" — e.g. "I'm working on X but I know nothing about the Y modules/domain, help me figure out my unknowns so I can prompt better," "teach me what I don't know about Z so I can ask better questions." It produces a grounded briefing (terminology, hidden constraints, adjacent systems, risky decisions) plus concrete follow-up prompts, rather than a generic explainer.
---

# Blind Spot Pass

Surface what the user doesn't know to ask about yet, grounded in the real
codebase or domain — not a generic tutorial.

## Steps

1. **Identify the target.** Pin down the domain, module, or subject the user
   named and what they're trying to accomplish with it.

2. **Investigate for real.** For a codebase domain, read the relevant
   entry points, adjacent modules, tests, and any existing docs (use the
   Explore agent for a broad sweep if the area is large). For a non-code
   domain, draw on real domain knowledge — don't hand-wave.

3. **Write a grounded briefing**, not a generic overview:
   - **Terminology map** — the handful of terms/concepts someone new to this
     would need, defined in terms of what's actually here.
   - **Hidden constraints & gotchas** — things that aren't obvious from a
     first read (invariants, ordering requirements, footguns).
   - **Adjacent systems** — what else touches this and could break or need
     coordinating.
   - **High-stakes decisions** — choices in this area that are expensive or
     risky to get wrong or reverse.

4. **End with 3–5 concrete prompts** the user could now ask, each specific
   to what was actually found (not templated placeholders) — this is the
   deliverable that lets them prompt better next time.

Keep the whole thing tight — a briefing, not a course.
