import { describe, expect, test } from 'claude-code/testing'

import { displayModel, effortLabel, formatLines, parseNumstat, toPlain } from './format'
import type { LineInput } from './format'

// Expected strings are statusline.sh's output for the same inputs, ANSI stripped,
// except where a test says the mod deliberately differs.
const NOW = 1_800_000_000_000
const inMinutes = (m: number) => new Date(NOW + (m * 60 + 30) * 1000).toISOString()
const OPUS = 'claude-opus-5-5'

const base: LineInput = {
  model: OPUS,
  effort: { sessionModel: OPUS, level: 'high' },
  projectDir: '/work/proj/myproj',
  home: '/Users/me',
  percent: 42,
  window: 200_000,
  tokens: 85_400,
  autoCompactWindow: 0,
  rateLimits: [],
  costUsd: 0,
  git: null,
  nowMs: NOW,
}

describe('parity with statusline.sh', () => {
  test('rate limits with pace under and over', () => {
    const lines = formatLines({
      ...base,
      costUsd: 3.2,
      rateLimits: [
        { kind: 'five_hour', percentUsed: 35.4, resetsAt: inMinutes(150) },
        { kind: 'seven_day', percentUsed: 80, resetsAt: inMinutes(2 * 1440) },
      ],
    })
    expect(toPlain(lines)).toBe(
      'Opus 5.5 (200K) high |  myproj\n████░░░░░░ 42% 200K  |  5h 35% ⇣15% 2h  7d 80% ⇡9% 2d',
    )
    expect(lines[0][0]).toEqual({ text: 'Opus 5.5 (200K) high', color: 'cyan' })
    expect(lines[1][0]).toEqual({ text: '████░░░░░░', color: 'green' })
  })

  test('no rate limits falls back to placeholders and cost', () => {
    // Differs from statusline.sh on purpose: unknown effort is "–", not "medium".
    const lines = formatLines({
      ...base,
      model: 'claude-sonnet-5-5[1m]',
      effort: null,
      percent: 95,
      window: 1_000_000,
      tokens: null,
      costUsd: 1.234,
    })
    expect(toPlain(lines)).toBe('Sonnet 5.5 (1M) – |  myproj\n█████████░ 95% 1M |  5h --  7d --  $1.23')
    expect(lines[1][0]?.color).toBe('red')
  })

  test('auto-compact window and worktree name', () => {
    const lines = formatLines({
      ...base,
      effort: { sessionModel: OPUS, level: 'max' },
      projectDir: '/Users/u/code/myrepo/.claude/worktrees/feature-x',
      percent: 25,
      tokens: 72_000,
      autoCompactWindow: 100_000,
      rateLimits: [
        { kind: 'five_hour', percentUsed: 90, resetsAt: inMinutes(45) },
        { kind: 'seven_day', percentUsed: 5 },
      ],
    })
    expect(toPlain(lines)).toBe('Opus 5.5 (100K) max |  myrepo/feature-x\n███████░░░ 72% 100K |  5h 90% ⇡5% 45m  7d 5%')
    expect(lines[1][0]?.color).toBe('yellow')
  })

  test('truncates long model and project names', () => {
    const model = 'Some Extremely Long Model Name v2'
    const lines = formatLines({
      ...base,
      model,
      effort: { sessionModel: model, level: 'low' },
      projectDir: '/work/proj/a-really-long-project-directory-name',
      percent: 0,
      window: 0,
      tokens: null,
    })
    expect(toPlain(lines)).toBe(
      'Some Extremely Long Mod… low |  a-really-long-project-dir…\n░░░░░░░░░░ 0%                |  5h --  7d --',
    )
  })

  test('git branch and diff stats', () => {
    const lines = formatLines({ ...base, git: { branch: 'master', files: 2, added: 10, deleted: 3 } })
    expect(toPlain(lines).split('\n')[0]).toBe('Opus 5.5 (200K) high |  myproj (master) 2f +10 -3')
    expect(lines[0]).toContainEqual({ text: '+10', color: 'green' })
    expect(lines[0]).toContainEqual({ text: '-3', color: 'red' })
  })
})

// Regression: 0.1 showed settings.json's effortLevel ("high") while the session
// actually sent "medium", and kept a stale effort after a model switch.
describe('effort shows only what the session really sent', () => {
  test('before the first model request it is a dash, never a settings guess', () => {
    expect(effortLabel(null, OPUS)).toBe('–')
    const [line1] = formatLines({ ...base, effort: null })
    expect(line1[0]?.text).toBe('Opus 5.5 (200K) –')
  })

  test('the recorded request effort wins', () => {
    const [line1] = formatLines({ ...base, effort: { sessionModel: OPUS, level: 'medium' } })
    expect(line1[0]?.text).toBe('Opus 5.5 (200K) medium')
  })

  test('a /model switch clears the effort recorded under the old model', () => {
    const lines = formatLines({ ...base, model: 'claude-haiku-5-5', effort: { sessionModel: OPUS, level: 'high' } })
    expect(lines[0][0]?.text).toBe('Haiku 5.5 (200K) –')
  })

  test('a model without effort shows a dash', () => {
    expect(effortLabel({ sessionModel: 'claude-haiku-5-5', level: null }, 'claude-haiku-5-5')).toBe('–')
  })

  test('an integer effort budget is shown as is', () => {
    expect(effortLabel({ sessionModel: OPUS, level: 32_000 }, OPUS)).toBe('32000')
  })
})

// Regression: the context label must come from the engine's measured window,
// never from the model id, so the two can't disagree.
describe('model and context label', () => {
  test('a [1m] id on a 200K window shows the window', () => {
    const model = 'claude-opus-5-5[1m]'
    const [line1] = formatLines({ ...base, model, effort: { sessionModel: model, level: 'high' }, window: 200_000 })
    expect(line1[0]?.text).toBe('Opus 5.5 (200K) high')
  })

  test('a 1M window shows 1M once, whatever the name says', () => {
    const model = 'Opus 5.5 (1M context)'
    const [line1] = formatLines({ ...base, model, effort: { sessionModel: model, level: 'high' }, window: 1_000_000 })
    expect(line1[0]?.text).toBe('Opus 5.5 (1M) high')
  })

  test('displayModel maps ids and aliases to names without context', () => {
    expect(displayModel('claude-opus-5-5')).toBe('Opus 5.5')
    expect(displayModel('claude-opus-5-5[1m]')).toBe('Opus 5.5')
    expect(displayModel('claude-sonnet-5-5-20260901')).toBe('Sonnet 5.5')
    expect(displayModel('opus[1m]')).toBe('Opus')
    expect(displayModel('Opus 5.5 (1M context)')).toBe('Opus 5.5')
  })
})

describe('helpers', () => {
  test('parseNumstat skips binary files', () => {
    expect(parseNumstat('3\t1\ta.ts\n-\t-\timg.png\n7\t2\tb.ts\n')).toEqual({ files: 2, added: 10, deleted: 3 })
  })
})
