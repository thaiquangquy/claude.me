import { describe, expect, test } from 'claude-code/testing'

import { formatLines, parseNumstat, toPlain } from './format'
import type { LineInput } from './format'

// Expected strings follow statusline.sh's output for the same inputs (ANSI stripped),
// minus the model/context/effort column the Claude UI already shows.
const NOW = 1_800_000_000_000
const inMinutes = (m: number) => new Date(NOW + (m * 60 + 30) * 1000).toISOString()

const base: LineInput = {
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

describe('parity with statusline.sh minus model/effort', () => {
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
      'myproj\n████░░░░░░ 42% 200K |  5h 35% ⇣15% 2h  7d 80% ⇡9% 2d',
    )
    expect(lines[1][0]).toEqual({ text: '████░░░░░░', color: 'green' })
  })

  test('no rate limits falls back to placeholders and cost', () => {
    const lines = formatLines({
      ...base,
      percent: 95,
      window: 1_000_000,
      tokens: null,
      costUsd: 1.234,
    })
    expect(toPlain(lines)).toBe('myproj\n█████████░ 95% 1M |  5h --  7d --  $1.23')
    expect(lines[1][0]?.color).toBe('red')
  })

  test('auto-compact window and worktree name', () => {
    const lines = formatLines({
      ...base,
      projectDir: '/Users/u/code/myrepo/.claude/worktrees/feature-x',
      percent: 25,
      tokens: 72_000,
      autoCompactWindow: 100_000,
      rateLimits: [
        { kind: 'five_hour', percentUsed: 90, resetsAt: inMinutes(45) },
        { kind: 'seven_day', percentUsed: 5 },
      ],
    })
    expect(toPlain(lines)).toBe('myrepo/feature-x\n███████░░░ 72% 100K |  5h 90% ⇡5% 45m  7d 5%')
    expect(lines[1][0]?.color).toBe('yellow')
  })

  test('truncates long project names', () => {
    const lines = formatLines({
      ...base,
      projectDir: '/work/proj/a-really-long-project-directory-name',
      percent: 0,
      window: 0,
      tokens: null,
    })
    expect(toPlain(lines)).toBe(
      'a-really-long-project-dir…\n░░░░░░░░░░ 0% |  5h --  7d --',
    )
  })

  test('git branch and diff stats', () => {
    const lines = formatLines({ ...base, git: { branch: 'master', files: 2, added: 10, deleted: 3 } })
    expect(toPlain(lines).split('\n')[0]).toBe('myproj (master) 2f +10 -3')
    expect(lines[0]).toContainEqual({ text: '+10', color: 'green' })
    expect(lines[0]).toContainEqual({ text: '-3', color: 'red' })
  })
})

describe('helpers', () => {
  test('parseNumstat skips binary files', () => {
    expect(parseNumstat('3\t1\ta.ts\n-\t-\timg.png\n7\t2\tb.ts\n')).toEqual({ files: 2, added: 10, deleted: 3 })
  })
})
