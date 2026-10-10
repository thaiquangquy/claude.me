# pace-line Privacy Policy

Last updated: 2026-10-10

pace-line is a Claude Code mod that draws a two-line status band above the prompt. It runs entirely on your own machine, inside Claude Code.

## What it collects

Nothing. pace-line does not collect, store, transmit, sell or share any personal data or usage data.

## What it reads, locally

To draw the band, pace-line reads the following while it runs. None of it leaves your machine and none of it is written to disk:

- From Claude Code: the session model, the effort level of each model request, context use, rate-limit percentages and reset times, session cost, and the project directory path.
- Two environment variables: `CLAUDE_CODE_AUTO_COMPACT_WINDOW` and `HOME`.
- From `git`, run read-only in the project directory: the current branch and the number of files and lines changed.

The README section "What it runs and sends" lists the exact commands.

## Network

pace-line makes no network requests. It has no analytics, telemetry, crash reporting or third-party services.

## Storage

The two rendered lines and the last effort level are held in the Claude Code session's memory while the session runs. pace-line keeps no files, logs or caches of its own.

## Changes

Any change to this policy is committed to this file in the [thaiquangquy/claude.me](https://github.com/thaiquangquy/claude.me) repository, with the date above updated.

## Contact

Open an issue at <https://github.com/thaiquangquy/claude.me/issues>.
