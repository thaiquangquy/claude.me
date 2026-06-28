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
Numbered list. Each item must have:
  - one action verb (Create / Modify / Delete / Move)
  - one specific file or function name
  - one short outcome phrase
No sub-steps. No prose. Max 10 items.
If more than 10 steps are needed, split into phases
and label them Phase 1 / Phase 2.

## Risks
Bullet list prefixed with ! for each uncertainty,
assumption, or potential side effect. If none, write "None."

## Questions
Numbered list. Only include genuine blockers.
Each question must include a default in parentheses:
  Q1. Question text (default: your assumed answer)
If no questions, write "None."

## Files
One line per file: A / M / D prefix then path.
A = add, M = modify, D = delete.
