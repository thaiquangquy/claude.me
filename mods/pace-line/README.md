# pace-line

Know how fast you are burning your Claude quota, without leaving the prompt.

```
Opus 5.5 (1M) medium |  claude.me (master) 2f +10 -3
████░░░░░░ 42% 1M    |  5h 35% ⇣15% 2h  7d 80% ⇡9% 2d
```

## 🌟 Highlights

- **Pace, not just usage**: the 5-hour and 7-day limits show how far ahead (`⇡`, red) or behind (`⇣`, green) an even burn you are, with the time to reset.
- **Terminal and desktop**: one band above the prompt in the terminal and the desktop Code tab; the `surfaces` option limits it to one of them.
- **Honest effort**: shows the effort the session actually sent with its last model request, never a guess from `settings.json`.
- **Git at a glance**: project, branch, and files changed with lines added and deleted.
- **No setup scripts**: a plugin of function hooks; no `jq`, no shell script, no `statusLine` setting.

## ℹ️ Overview

pace-line is a Claude Code mod that draws the same two lines as this repo's [`statusline.sh`](../../statusline.sh) as a band directly above the prompt.

| Part | Meaning |
|---|---|
| `Opus 5.5 (1M)` | Session model and the context window Claude Code reports |
| `medium` | Effort of the session's last model request; `–` before the first request, after a `/model` switch, or for a model without effort |
| `claude.me (master) 2f +10 -3` | Project, branch, files changed, lines added and deleted |
| `████░░░░░░ 42% 1M` | Context used: green below 70%, yellow from 70%, red from 90% |
| `5h 35% ⇣15% 2h` | 5-hour limit: used, pace, time to reset |
| `7d 80% ⇡9% 2d` | 7-day limit: used, pace, time to reset |

**Pace** is the used % minus the share of the window already elapsed. `⇡9%` means you are 9 points ahead of an even burn and will hit the limit before it resets; `⇣15%` means you have room to spare. Without rate-limit data (an API-key account) the band shows `5h --  7d --` and the session cost instead.

### 🔒 What it runs and sends

**Sends nothing.** pace-line makes no network calls and writes no files. Everything it shows comes from your own machine and stays there; the only output is the band it draws.

**Reads**, locally, through Claude Code's hook API:

| Call | What it reads | Why |
|---|---|---|
| `$.session.usage()` | Context use, rate-limit percentages and reset times, session cost | Context bar, 5h/7d pace |
| `$.session.model()` | Session model id | Model name, and to tie effort to the model |
| `$.session.root()` | Project directory path | Project name, the folder `git` runs in |
| `$.env.get('CLAUDE_CODE_AUTO_COMPACT_WINDOW')`, `$.env.get('HOME')` | Two environment variables | Context-window label; shorten the path to `~` |
| `turn.step` event | The effort level of each main-loop model request | Effort label |

**Runs one program: `git`**, through `$.process.run`, which starts a local program and reads its output. It is read-only (`--no-optional-locks` keeps it from touching the index), runs in the project directory, at most once every 5 seconds and after an edit tool. These are the only commands, word for word, with `<dir>` the project directory:

| Command | Why |
|---|---|
| `git -C <dir> --no-optional-locks rev-parse --git-dir` | Check the project is a git repo |
| `git -C <dir> --no-optional-locks branch --show-current` | Branch name |
| `git -C <dir> --no-optional-locks diff HEAD --numstat` | Files changed, lines added and deleted |

Outside a git repo, the git part of line 1 is left out.

### ✍️ Authors

- [thaiquangquy](https://github.com/thaiquangquy)

## 🚀 Usage

Once installed, the band appears above the prompt in every session. Configure it in `/config` (the `pace-line` rows); a change applies at once.

| Option | Values | Effect |
|---|---|---|
| `surfaces` | `both` (default), `desktop`, `terminal` | Where the band shows; `desktop` leaves the terminal to `statusline.sh` |
| `showModel` | `true` (default), `false` | `false` drops model, context window and effort from line 1 (the Claude UI already shows them) |

Or from a shell:

```bash
echo '{"surfaces":"desktop","showModel":"false"}' | claude plugin configure pace-line --values-stdin
```

Turn it off everywhere, and back on:

```bash
claude plugin disable pace-line
```

```bash
claude plugin enable pace-line
```

## ⬇️ Installation

From a terminal Claude Code session (the desktop Code tab cannot run this command):

```
/plugin install pace-line --marketplace thaiquangquy/claude.me
```

Answer `y` to add the marketplace, then pick the **user** scope so the band shows in every session, desktop included.

Update to a newer version, then run `/reload-plugins` in any open session:

```bash
claude plugin update pace-line
```

For development setup, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 💭 Feedback and Contributing

Open an issue or a pull request on [thaiquangquy/claude.me](https://github.com/thaiquangquy/claude.me). See [DEVELOPMENT.md](DEVELOPMENT.md) for running and testing the mod locally.

pace-line is part of [claude.me](../../README.md).

## 📄 License

[MIT](../../LICENSE)
