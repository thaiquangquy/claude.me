---
name: create-readme
description: This skill should be used when the user says "create a README", "generate a README.md", "write a README for this project", "make a readme", or asks to document a project's usage/installation/setup. It inspects the target project for real, evidenced facts (manifest files, existing docs, CI config, directory layout) and generates a README.md following the banesullivan/README template structure (Highlights, Overview, Usage, Installation, Feedback and Contributing), plus a companion DEVELOPMENT.md holding all contributor/dev-workflow instructions, never fabricating authors, license terms, or usage claims not found in the repo.
---

# Create README

Generate a user-facing `README.md` and, where warranted, a companion
`DEVELOPMENT.md` that holds everything a contributor needs — keeping the
README focused on what a *user* of the project needs to know, and pushing
build/test/dev-workflow details into DEVELOPMENT.md instead of burying them
in the README.

## Steps

1. **Gather real facts about the project.** Read manifest files that exist
   (`package.json`, `pyproject.toml`, `setup.py`/`setup.cfg`, `Cargo.toml`,
   `go.mod`, `composer.json`, `Gemfile`, etc.), any existing `README.md`,
   `CONTRIBUTING.md`, `LICENSE`/`LICENSE.md`, the top-level directory layout,
   and CI config (`.github/workflows/*`, `.gitlab-ci.yml`, `.circleci/*`,
   etc.). Extract name, description, language/tooling, scripts
   (build/test/lint/dev/publish), entry points, license, and
   authors/maintainers (`package.json` `author`/`contributors`, the LICENSE
   copyright line, a `CONTRIBUTORS` file, or an existing README's authors
   section). Never invent an author, license, install command, or usage
   example that isn't evidenced by something actually in the repo — if a
   fact can't be found, omit it rather than guessing.

2. **Decide whether `DEVELOPMENT.md` is warranted.** Default to creating it
   whenever the project has a build/test/lint toolchain, more than a single
   trivial install command, multiple packages/workspaces, or CI. Skip it
   only for genuinely trivial projects (e.g. a pure content/docs repo with no
   build step) — in that case, fold the one-line setup instruction into the
   README's Installation section instead and say so.

3. **Preserve existing accurate content.** If `README.md` (or
   `DEVELOPMENT.md`) already exists, read it in full first. Carry forward
   real badges, authors, license mentions, and any usage snippets that are
   still accurate — don't blindly clobber a hand-customized doc. Only
   rewrite what's stale or misplaced (e.g. move embedded dev instructions
   that belong in DEVELOPMENT.md out of the README).

4. **Write `README.md`** using this section structure (based on
   https://github.com/banesullivan/README's `TEMPLATE.md` — keep this
   section set and the emoji headers, adapt the content to the project):
   - Title + badges — only badges that reflect this repo's real CI, license,
     or package registry; never fabricate one.
   - A short framing line about the value of good docs (optional flourish —
     keep or drop based on the project's tone).
   - `## 🌟 Highlights` — a short bullet list of what's notable about the
     project, grounded in what the code actually does.
   - `## ℹ️ Overview` — a longer description of what the project is/does,
     with an `### ✍️ Authors` subsection listing only authors/maintainers
     found in package metadata, the LICENSE, or existing docs.
   - `## 🚀 Usage` — how to use the project as a consumer (install as a
     dependency, run the CLI, import the library), with real command/code
     examples drawn from scripts or existing docs.
   - `## ⬇️ Installation` — end-user installation only (e.g. `pip install x`,
     `npm install x`, download a release). Do not add development/build
     instructions here — link out instead: "For development setup, see
     [DEVELOPMENT.md](DEVELOPMENT.md)."
   - `## 💭 Feedback and Contributing` — how to file issues/PRs; link to
     `DEVELOPMENT.md` and `CONTRIBUTING.md` if present.

5. **Write `DEVELOPMENT.md`** (when step 2 says it's warranted) using this
   section structure (based on
   https://github.com/pmndrs/native/blob/main/DEVELOPMENT.md — include only
   the sections that actually apply; e.g. skip "Monorepo Structure" and
   "Workspace Commands" for a single-package repo):
   - Title (`# Development Guide` or similar).
   - `## Monorepo Structure` — a directory tree, only if the repo really is
     a monorepo/workspace.
   - `## Getting Started` — `### Prerequisites` (language/runtime versions,
     required tools) and `### Installation` (clone + install-deps command,
     using the package manager actually in use).
   - `## Development Workflow` — subsections for whichever of
     Building / Running / Testing / Type Checking / Linting actually have a
     corresponding script or command in the project.
   - Project-specific sections as needed (e.g. environment variables,
     database setup) only if evidenced by config files.
   - `## Publishing` — only if the project has a real publish/release
     script or CI job.
   - `## Workspace Commands` — only for actual workspace/monorepo tooling
     (yarn workspaces, lerna, Nx, Turborepo).
   - `## Troubleshooting` — only include entries backed by something
     concrete (existing issues, FAQ, CI failure patterns); don't invent
     generic troubleshooting advice.
   - `## Project Structure Details` — deeper explanation of key
     directories, if useful beyond the top-level tree.
   - `## CI/CD` — summarize what the CI config actually runs.
   - `## References` — links to upstream docs already referenced elsewhere
     in the repo (framework docs, etc.).

6. **Cross-link the two files.** Make sure README.md's Installation and/or
   Feedback and Contributing sections link to `DEVELOPMENT.md`. Never
   duplicate the full dev workflow inline in the README — a one-line pointer
   is enough.

7. **Summarize the result** before finishing: list which files were
   created/updated, and for any pre-existing file, call out what was
   preserved versus rewritten.

Never fabricate authors, license terms, package registry names, badges, or
usage instructions that aren't backed by something actually present in the
repository — when in doubt, omit rather than invent.
