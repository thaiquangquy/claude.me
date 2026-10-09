import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { GitInfo } from '../types'
import { displayModel, formatLines, parseNumstat } from './format'

const effortAtom = atom({ plugin: 'pace-line', key: 'effort' } as const, null)
const linesAtom = atom({ plugin: 'pace-line', key: 'lines' } as const, null)

// Countdowns move by the minute; git and context change between turns.
const REFRESH_MS = 15_000
const GIT_TTL_MS = 5_000
const EDITING_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit', 'Bash'])

// Git info cache, keyed by directory. Module variables reset on hot reload.
let gitDir = ''
let gitAt = 0
let gitInfo: GitInfo | null = null

async function git($: EngineInterface, dir: string, now: number): Promise<GitInfo | null> {
  if (dir === gitDir && now - gitAt < GIT_TTL_MS) return gitInfo
  const run = (args: string[]) => $.process.run(['git', '-C', dir, '--no-optional-locks', ...args])
  const probe = await run(['rev-parse', '--git-dir'])
  let info: GitInfo | null = null
  if (probe.exitCode === 0) {
    const [branch, diff] = await Promise.all([run(['branch', '--show-current']), run(['diff', 'HEAD', '--numstat'])])
    info = { branch: branch.stdout.trim(), ...parseNumstat(diff.stdout) }
  }
  gitDir = dir
  gitAt = now
  gitInfo = info
  return info
}

async function refresh($: EngineInterface): Promise<void> {
  const [usage, model, dir, settings, acw, home, effort, now] = await Promise.all([
    $.session.usage(),
    $.session.model(),
    $.session.root(),
    $.settings.read(),
    $.env.get('CLAUDE_CODE_AUTO_COMPACT_WINDOW'),
    $.env.get('HOME'),
    read($, effortAtom),
    $.clock.now(),
  ])
  const settingsEffort = (settings as Record<string, unknown>).effortLevel
  const lines = formatLines({
    model: displayModel(model),
    projectDir: dir,
    home: home ?? '',
    percent: usage.context.percent ?? 0,
    window: usage.context.window,
    tokens: usage.context.tokens ?? null,
    autoCompactWindow: /^\d+$/.test(acw ?? '') ? Number(acw) : 0,
    effort: effort ?? (typeof settingsEffort === 'string' ? settingsEffort : null),
    rateLimits: usage.rateLimits,
    costUsd: usage.cost?.usd ?? 0,
    git: await git($, dir, now),
    nowMs: now,
  })
  await update($, linesAtom, () => lines)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await refresh($)
    $.clock.every(REFRESH_MS, () => void refresh($))

    return result
  })

  // Each main-loop model request carries the session's effort; the response
  // brings new context and rate-limit figures.
  on('turn.step', async function* ($, e, next) {
    const isMain = e.agentId === undefined
    if (isMain && typeof e.effort === 'string') {
      const effort = e.effort
      await update($, effortAtom, () => effort)
    }
    const result = yield* next(e)
    if (isMain) await refresh($)

    return result
  })

  // Edits change the git stats: drop the cache so the next refresh re-reads.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    if (EDITING_TOOLS.has(e.tool)) {
      gitAt = 0
      await refresh($)
    }

    return result
  }).catch(($, e, next) => next(e)) // A display mod never blocks a tool: replay the result.

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const lines = await read($, linesAtom)
    if (lines === null || e.props.hasSurvey) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {lines.map((line, row) => (
          <Box key={`row${row}`}>
            {line.map((seg, i) => (
              <Text key={`s${i}`} color={seg.color} dimColor={seg.dim}>
                {seg.text}
              </Text>
            ))}
          </Box>
        ))}
      </Box>
    )
  })
}
