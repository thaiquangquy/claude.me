// Port of statusline.sh's formatting. No `$` here so it can be unit-tested.
// Model, context window and effort are left out: the Claude UI already shows them.
// Line1: project (branch) Nf +A -D
// Line2: bar PCT% CL | 5h used% [⇡⇣pace] countdown  7d used% [⇡⇣pace] countdown

import type { Color, GitInfo, Line, Segment } from '../types'

export type RateLimit = { kind: string; percentUsed: number; resetsAt?: string }

export type LineInput = {
  projectDir: string
  home: string
  // Context window: used percentage, window size, input tokens (null = unknown).
  percent: number
  window: number
  tokens: number | null
  // CLAUDE_CODE_AUTO_COMPACT_WINDOW, 0 when unset.
  autoCompactWindow: number
  rateLimits: readonly RateLimit[]
  costUsd: number
  git: GitInfo | null
  nowMs: number
}

const FIVE_HOUR_MIN = 300
const SEVEN_DAY_MIN = 10080

export function contextLabel(ctx: number): string {
  if (ctx >= 1_000_000) return `${Math.trunc(ctx / 1_000_000)}M`
  if (ctx > 0) return `${Math.trunc(ctx / 1000)}K`
  return ''
}

function truncate(s: string, max: number): string {
  return [...s].length > max ? `${[...s].slice(0, max).join('')}…` : s
}

function levelColor(pct: number): Color {
  if (pct >= 90) return 'red'
  if (pct >= 70) return 'yellow'
  return 'green'
}

// Whole minutes until an ISO timestamp; null when missing or unparseable.
export function minutesUntil(resetsAt: string | undefined, nowMs: number): number | null {
  if (!resetsAt) return null
  const epoch = Math.trunc(Date.parse(resetsAt) / 1000)
  if (!Number.isFinite(epoch) || epoch <= 0) return null
  const mins = Math.trunc((epoch - Math.trunc(nowMs / 1000)) / 60)
  return mins < 0 ? 0 : mins
}

// Port of _usage: used% [pace delta] countdown.
export function usageSegments(used: number | null, rm: number | null, windowMin: number): Segment[] {
  const out: Segment[] = []
  if (used === null) {
    out.push({ text: '--' })
  } else {
    out.push({ text: `${used}%`, color: levelColor(used) })
    if (rm !== null && rm <= windowMin) {
      // Positive = over pace (overspend), negative = under pace (surplus).
      const d = used - Math.trunc(((windowMin - rm) * 100) / windowMin)
      if (d > 0) out.push({ text: ' ' }, { text: `⇡${d}%`, color: 'red' })
      if (d < 0) out.push({ text: ' ' }, { text: `⇣${-d}%`, color: 'green' })
    }
  }
  if (rm === null) return out
  let label: string
  if (rm >= 1440) label = `${Math.trunc(rm / 1440)}d`
  else if (rm >= 60) label = `${Math.trunc(rm / 60)}h`
  else label = `${rm}m`
  out.push({ text: ' ' }, { text: label, dim: true })
  return out
}

function projectSegments(input: LineInput): Segment[] {
  const dir = input.projectDir
  let pn = dir.slice(dir.lastIndexOf('/') + 1)
  let isWorktree = false
  let repo = ''
  let worktree = ''
  const tilded = input.home && dir.startsWith(input.home) ? `~${dir.slice(input.home.length)}` : dir
  const wt = /\/([^/]+)\/\.claude\/worktrees\/([^/]+)/.exec(tilded)
  if (wt?.[1] && wt[2]) {
    isWorktree = true
    repo = wt[1]
    worktree = wt[2]
    pn = repo
  }
  pn = truncate(pn, 25)

  const git = input.git
  if (git && git.branch) {
    const out: Segment[] = [{ text: `${pn} (${truncate(git.branch, 35)})` }]
    if (git.files > 0) {
      out.push(
        { text: ` ${git.files}f ` },
        { text: `+${git.added}`, color: 'green' },
        { text: ' ' },
        { text: `-${git.deleted}`, color: 'red' },
      )
    }
    return out
  }
  if (isWorktree) return [{ text: truncate(`${repo}/${worktree}`, 25) }]
  return [{ text: pn }]
}

export function formatLines(input: LineInput): [Line, Line] {
  // Auto-compact window: measure against the compaction threshold instead of
  // the full window when CLAUDE_CODE_AUTO_COMPACT_WINDOW is set.
  let pct = Math.trunc(input.percent)
  let ctx = input.window
  let acw = input.autoCompactWindow
  if (acw > 0 && input.tokens !== null && input.tokens >= 0) {
    if (ctx > 0 && acw > ctx) acw = ctx
    pct = Math.trunc((input.tokens * 100) / acw)
    if (pct > 100) pct = 100
    ctx = acw
  }
  const cl = contextLabel(ctx)

  // Progress bar.
  const filled = Math.min(10, Math.max(0, Math.trunc(pct / 10)))
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)

  const line1: Line = projectSegments(input)

  // Rate limits: real-time from the session; placeholders + cost when absent.
  const hasRateLimits = input.rateLimits.length > 0
  const five = input.rateLimits.find(r => r.kind === 'five_hour')
  const seven = input.rateLimits.find(r => r.kind === 'seven_day')
  const u5 = hasRateLimits && five ? Math.floor(five.percentUsed) : null
  const u7 = hasRateLimits && seven ? Math.floor(seven.percentUsed) : null
  const rm5 = hasRateLimits ? minutesUntil(five?.resetsAt, input.nowMs) : null
  const rm7 = hasRateLimits ? minutesUntil(seven?.resetsAt, input.nowMs) : null

  const line2: Line = [
    { text: bar, color: levelColor(pct) },
    { text: cl ? ` ${pct}% ${cl}` : ` ${pct}%` },
    { text: ' ' },
    { text: '|', dim: true },
    { text: '  ' },
    { text: '5h ' },
    ...usageSegments(u5, rm5, FIVE_HOUR_MIN),
    { text: '  7d ' },
    ...usageSegments(u7, rm7, SEVEN_DAY_MIN),
  ]
  if (!hasRateLimits) {
    const cost = `$${input.costUsd.toFixed(2)}`
    if (cost !== '$0.00') line2.push({ text: `  ${cost}` })
  }

  return [line1.filter(s => s.text !== ''), line2.filter(s => s.text !== '')]
}

// Plain text of the lines, for tests and debugging.
export function toPlain(lines: readonly Line[]): string {
  return lines.map(l => l.map(s => s.text).join('')).join('\n')
}

// Parses `git diff HEAD --numstat` output into file/added/deleted counts,
// skipping binary files (reported as "-").
export function parseNumstat(stdout: string): { files: number; added: number; deleted: number } {
  let files = 0
  let added = 0
  let deleted = 0
  for (const row of stdout.split('\n')) {
    const [a, d] = row.split('\t')
    if (!/^\d+$/.test(a ?? '')) continue
    files += 1
    added += Number(a)
    deleted += Number(d) || 0
  }
  return { files, added, deleted }
}
