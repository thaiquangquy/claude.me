---
name: reference-reimplement
description: This skill should be used when the user points to an existing reference implementation (a vendored library, another repo, code in a different language) and wants the same behavior reimplemented in the current codebase — e.g. "this Rust crate in vendor/rate-limiter implements the exact backoff behavior I want, read it and reimplement the same semantics in our TypeScript client." Focuses on matching behavior/semantics idiomatically, not transliterating syntax.
---

# Reference Reimplement

Port semantics, not syntax — read the reference in full, then write
idiomatic target-language code that matches its actual behavior.

## Steps

1. **Read the reference implementation in full** before touching the target
   code. Don't skim — the whole point is faithfulness to behavior.

2. **Extract the semantics that matter**: the algorithm, edge cases, timing
   or ordering guarantees, error handling, and any invariants — not the
   literal structure or idioms of the source language.

3. **Reimplement idiomatically** in the target language/codebase, matching
   the source's conventions and existing patterns rather than the
   reference's style.

4. **Note deliberate deviations.** If something differs because of language
   idioms, dependency differences, or the target codebase's constraints,
   say so explicitly and why — don't silently diverge from the semantics
   the user asked to preserve.
