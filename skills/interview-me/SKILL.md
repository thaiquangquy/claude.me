---
name: interview-me
description: This skill should be used when the user asks to be interviewed before implementation starts — e.g. "interview me one question at a time about anything ambiguous, prioritize questions where my answer would change the architecture." Surfaces and ranks ambiguous decisions, then asks about them one at a time (waiting for each answer) instead of front-loading a list or guessing.
---

# Interview Me

Surface ambiguity before implementation, and resolve it through a real
one-at-a-time interview instead of a dumped list of questions or silent
guessing.

## Steps

1. **Scan for ambiguity** in the request and the relevant code: data model
   shape, API surface, naming, UX behavior, edge-case handling, anything
   with more than one defensible interpretation.

2. **Rank by leverage.** Order the ambiguities by how much the answer would
   change the architecture or approach — highest-leverage first. Low-stakes,
   easily-reversible ambiguities go last or get dropped.

3. **Ask exactly one question at a time.** Use the AskUserQuestion tool
   when the question fits a small set of concrete options; use plain text
   for open-ended ones. Wait for the answer before asking the next question
   — never front-load the full list.

4. **Stop once remaining unknowns are low-stakes.** Say explicitly that
   you're proceeding with reasonable defaults for anything left unresolved,
   and name those defaults so the user can correct them if wrong.
