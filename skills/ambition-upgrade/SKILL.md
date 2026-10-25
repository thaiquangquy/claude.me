---
name: "ambition-upgrade"
description: "Use when Quy asks to be more ambitious with a task, to go deeper, to raise the level, or runs an 'ambition pass' on a prompt, plan, or piece of work."
---

# Ambition upgrade

Source idea: Felix Rieseberg, "How to be more ambitious: A tutorial for humans with models" (felixrieseberg.com, Oct 2026).

People usually ask a model for the task they can see. This skill finds the bigger, deeper, or wider version of that task. Then it turns that version into a prompt or plan that can actually run.

Ambition has four axes. Ignore Speed (same work, less time). It needs no special method. Use the other three.

- **Altitude**: aim at the outcome, not the task.
- **Depth**: do the task the way the best expert in the field would.
- **Range**: bring in methods from other fields.

## Step 1: Capture the task

1. Write the task in one sentence, as Quy gave it.
2. Write what "done" means today.
3. If the task has no clear outcome, ask one short question. Otherwise continue.

## Step 2: Pick the axes

Do not apply all three by default. Choose.

- Use **Altitude** when the work serves a business or system outcome. A strong signal: people will hold a meeting about the result.
- Use **Depth** when the task must be done very well (a design, an analysis, a performance fix, a hard bug).
- Use **Range** when the task touches people, communication, or a problem that a single field framed badly.
- Skip Altitude for creative work. It turns art into a KPI.

State which axes you chose and why, in one line each.

## Step 3: Altitude — climb the ladder

1. Ask: "When this task is done, what must happen next?" Write the answer as rung 2.
2. Ask the same question about rung 2. Write rung 3. Stop at 3 or 4 rungs.
3. Example ladder:
   - Rung 1: Fix this crash.
   - Rung 2: Find and fix the top crashes each week.
   - Rung 3: Keep the app crash-free without a human filing tasks.
4. For the highest useful rung, list what the agent needs to run the loop alone:
   - data access (logs, crash reports, metrics, tickets),
   - mapping (build version to git commit, service to owner),
   - an environment where it can reproduce and verify a fix,
   - permission boundaries and a human approval gate.
5. Recommend one rung. Say what stops a higher rung today.

## Step 4: Depth — work like the field leader

Apply each item. Write the concrete result for this task.

1. **Real instruments, not real vocabulary.** Name the tools a top expert uses (profilers, load tests, a database, statistical models, tracing, formal specs). Reject markdown tables and prose when the expert would use a tool.
2. **Raw material.** Name the rawest input: raw logs, raw events, the source code, the actual traffic. Do not start from summaries someone already digested.
3. **Unreasonable target.** Set a target 10x past the request (10 s page load becomes 200 ms; 99.9% becomes 99.99%). Treat it as solvable. If the target fails, report the real limit and what blocks it.
4. **Attack assumptions.** List the beliefs the task rests on. Try to reproduce each one from raw data. Example: "We believe latency comes from the DB. Prove it from traces."
5. **New knowledge.** After the assumptions, look for a signal nobody knows yet. Show it on data the analysis did not see.
6. **Outside judge.** Never let the model grade its own work. Name an external check: tests, benchmarks, a simulator, a type checker, production metrics, a held-out dataset, or a human expert. Prefer a check the agent can run itself in a loop.

Use this depth question set when rewriting a prompt:
- What would a top professional do here that the prompt does not ask for?
- What raw material would they start from?
- Which methods and tools would they use?
- What, other than the model or Quy, proves the result is correct?

## Step 5: Range — assemble the crew

1. **Nouns to verbs.** Rewrite the deliverable as what it must do. "A design doc" becomes "make five engineers agree on one trade-off and remember why in a year."
2. **Pick fields from the verbs.** Use the high-stakes test: "If this must be excellent or the project fails, which specialists join the team?" Pick 3 to 5 fields. Include one adversarial field (red team, SRE doing a failure review, security tester, short seller, forensic accountant, a skeptical customer).
3. **Borrow methods, not voices.** For each field, write the method it brings ("SRE: write the failure-mode table and the error budget"; "journalist: lead with the one finding that changes a decision"). Do not role-play. Do not write "in the voice of".
4. If subagents are available and Quy approves, give each field its own subagent with its method and inputs.

## Step 6: Output the ambition brief

Return this structure. Keep it short.

1. **Task as given** — one line.
2. **Axes chosen** — with one-line reasons.
3. **Altitude ladder** — rungs, the recommended rung, and the blocker for the next rung.
4. **Depth upgrades** — instruments, raw inputs, stretch target, assumptions to attack, outside judge.
5. **Range crew** — fields and the method each brings.
6. **Prerequisites** — access, connectors, environments, and tools the work needs. Mark which ones exist now.
7. **Rewritten prompt** — one ready-to-run prompt that asks for exactly the upgraded work.
8. **Trade-offs** — cost, time, risk, and what Quy gives up versus the original task. Say when the original task is the better choice.

Then ask one question: run the upgraded version now, or keep the brief.

## Rules

- Be specific to the task. A generic "think bigger" line is a failure.
- Give a recommendation. Do not stop at "it depends".
- Ambition still needs a working loop. If data access or a verification environment is missing, say so before promising the outcome.
- Do not raise scope on a fixed client deliverable without saying the cost and the risk.
- Permission to fail is part of the method. Report partial progress against the stretch target honestly.