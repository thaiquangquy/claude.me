---
name: brainstorm-and-prototype
description: This skill should be used when the user wants cheap, disposable options to react to before committing to a direction — e.g. "make me an HTML page with N wildly different design directions so I can react," "mock up this UI with fake data before wiring anything up, I want to react to the layout first," "brainstorm N places we could intervene, from cheapest to most ambitious, I'll tell you which ones resonate." Covers both visual/UI mockups and ranked option lists produced purely for reaction, not for shipping.
---

# Brainstorm and Prototype

Produce raw material for the user to react to — visual directions or a
ranked option list — before any real implementation starts.

## Steps

1. **Read what kind of divergence is being asked for**: visual/design
   variety, a UI layout to react to, or a list of intervention points/
   approaches. Infer this from the request rather than asking, unless it's
   genuinely unclear.

2. **For visual/UI asks**: build one self-contained HTML file (or a small
   set of them for "wildly different directions") using hardcoded/fake
   data. Do not wire it to the real app, real state, or real endpoints —
   the whole point is to react to the shape before touching the real
   system.

3. **For option-brainstorm asks**: search the codebase for the relevant
   surface area, then list options ordered cheapest/simplest →  most
   ambitious, one line of tradeoff per option. Ground every option in
   something real about the codebase, not generic advice.

4. **Present everything as material to react to, not a decision already
   made.** Explicitly invite the user to pick, combine, or reject before
   anything gets wired into the real app.

5. **Stop there.** Do not start implementing the chosen direction in this
   pass — that's a separate step once the user reacts.
