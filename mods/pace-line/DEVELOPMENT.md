# Development Guide

## Getting Started

### Prerequisites

- [Claude Code](https://claude.com/claude-code) with plugin hooks support (the `claude plugin validate` and `claude plugin test` commands)
- `git` on `PATH`: the mod runs `git` for the branch and diff stats

### Installation

```bash
git clone https://github.com/thaiquangquy/claude.me
cd claude.me
```

## Development Workflow

### Running

Load the mod from the working copy for one session:

```bash
claude --plugin-dir mods/pace-line
```

### Validating

Checks the manifest, the options and the hooks module the way the engine will load them:

```bash
claude plugin validate mods/pace-line
```

### Testing

Runs every `hooks/*.test.ts(x)` file against the engine:

```bash
claude plugin test mods/pace-line
```

| File | Covers |
|---|---|
| `hooks/format.test.ts` | Output parity with `statusline.sh`, effort rules, context label, `showModel`, `surfaces` |
| `hooks/band.test.tsx` | End-to-end: model requests run through the engine, the band drawn on terminal and desktop, both options |

### Type Checking

Once the engine has loaded the mod (`--plugin-dir` or an install), it writes its types to `.claude-plugin/types/` and a `tsconfig.json`, so:

```bash
npx -p typescript tsc -p mods/pace-line
```

Both are generated and ignored by `mods/pace-line/.gitignore`.

## Project Structure Details

| Path | Role |
|---|---|
| `.claude-plugin/plugin.json` | Manifest: name, version, license, icon, `userConfig` options |
| `.claude-plugin/icon.png` | Listing icon for the plugin directory |
| `hooks/hooks.json` | Points the engine at `register.tsx` |
| `hooks/register.tsx` | Hooks: `session.start`, `session.attach`, `turn.step` (records effort), `tool.call` (refreshes git stats), `ui.render` for `AbovePrompt` (draws the band) |
| `hooks/format.ts` | Pure formatting, ported from `statusline.sh`; no engine calls, so it is unit-tested directly |
| `types/index.d.ts` | The `$.state` contract: the last effort record and the two rendered lines |

## Publishing

The repo's `.claude-plugin/marketplace.json` lists the mod (`"source": "./mods/pace-line"`). To release:

1. Bump `version` in `.claude-plugin/plugin.json`.
2. Run `claude plugin validate mods/pace-line` and `claude plugin test mods/pace-line`: no warnings, all tests pass.
3. Push to `master`.
4. Users pick it up with `claude plugin update pace-line`.

For the plugin directory, the manifest carries `license` (MIT, text in the repo-root `LICENSE`) and `icon` (`.claude-plugin/icon.png`, 1024×1024). The icon becomes the listing icon only the first time the plugin is saved or submitted in the developer portal; changing the file later does not change the listing. The directory flags `"types"` as an unknown field; keep it, since `claude plugin validate` needs it to check the `$.state` keys against `types/index.d.ts`. Keep the README's "What it runs and sends" section in step with any new `$.process.run` command or data the mod reads.

## References

- [`statusline.sh`](../../statusline.sh): the shell status line this mod ports
- [claude.me README](../../README.md)
