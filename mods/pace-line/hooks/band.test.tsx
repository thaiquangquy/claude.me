import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const NOW = 1_800_000_000_000
const OPUS = 'claude-opus-5-5'
const BAND = {
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 4,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 2 },
    view: {},
  },
} as const

type Surface = 'terminal' | 'desktop'

// Stands in for the engine beneath the mod: attached surfaces, session figures,
// settings, env, git. settings.json says "high" on purpose: the mod must not use it.
function engine(on: On, surfaces: readonly Surface[] = ['terminal', 'desktop']) {
  const calls = { git: 0 }
  let model = OPUS
  mock.clock(on, { now: NOW })
  mock.env(on, { HOME: '/Users/me' })
  on('session.surfaces', () => ({ value: surfaces }))
  on('session.usage', () => ({
    value: {
      startedAt: NOW,
      context: { tokens: 186_000, window: 200_000, percent: 93 },
      rateLimits: [
        { kind: 'five_hour', percentUsed: 35, resetsAt: new Date(NOW + 150 * 60_000 + 30_000).toISOString() },
        { kind: 'seven_day', percentUsed: 80, resetsAt: new Date(NOW + 2 * 1440 * 60_000 + 30_000).toISOString() },
      ],
      cost: { usd: 1.5 },
    },
  }))
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('session.model', () => ({ value: model }))
  on('session.root', () => ({ value: '/work/myproj' }))
  on('settings.read', () => ({ value: { effortLevel: 'high' } }))
  on('process.run', (_$, e) => {
    calls.git += 1
    const args = e.argv.slice(4).join(' ')
    const stdout = args === 'branch --show-current' ? 'main\n' : args === 'diff HEAD --numstat' ? '4\t2\ta.ts\n' : '.git\n'
    return { value: { exitCode: 0, stdout, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  // The model request: answered here so the mod's turn.step hook runs above it.
  on('turn.step', async function* (_$, e) {
    return { turnId: e.turnId, index: e.index, answer: 'ok', toolUses: [], stopReason: 'end_turn' as const, usage: null }
  })
  // Nothing beneath the mod draws in a test: stand in for the engine's own band.
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  return {
    calls,
    switchModel: (next: string) => {
      model = next
    },
  }
}

// Runs one model request through the chain, as the session sends it.
async function step($: Engine, effort: 'medium' | undefined, agentId?: string) {
  const stream = $.turn.step({ turnId: 't1', index: 0, model: OPUS, effort, messageCount: 1, agentId })
  for await (const _ of stream) {
    // drain the chunks; the hooks finish once the stream ends
  }
}

// The cyan model/effort segment of line 1, as drawn on `surface`.
async function modelSegment($: Engine, surface: Surface) {
  const ui = await $.ui.mount({ plugin: 'pace-line', surface, ...BAND })
  const found = await ui.find({ type: 'Text', text: /^(Opus|Haiku) / })
  await ui.unmount()
  return found?.text
}

test('band draws both lines with the status colors on terminal and desktop', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'terminal', isInteractive: true })
  await step($, 'medium')

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'pace-line', surface, ...BAND })
    expect((await ui.find({ type: 'Text', text: 'Opus 5.5 (200K) medium' }))?.props.color).toBe('cyan')
    expect(await ui.find({ type: 'Text', text: 'myproj (main)' })).toBeDefined()
    expect((await ui.find({ type: 'Text', text: '+4' }))?.props.color).toBe('green')
    expect((await ui.find({ type: 'Text', text: '█████████░' }))?.props.color).toBe('red')
    expect((await ui.find({ type: 'Text', text: '⇣15%' }))?.props.color).toBe('green')
    expect((await ui.find({ type: 'Text', text: '⇡9%' }))?.props.color).toBe('red')
    await ui.unmount()
  }
})

// Regression for 0.1: settings.json said "high", the session sent "medium", the band showed "high".
test('effort comes from the request the session sent, not settings.json', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'desktop', isInteractive: true })
  expect(await modelSegment($, 'desktop')).toBe('Opus 5.5 (200K) –')

  await step($, 'medium')
  expect(await modelSegment($, 'desktop')).toBe('Opus 5.5 (200K) medium')
})

test('a subagent request does not change the effort shown', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'desktop', isInteractive: true })
  await step($, 'medium')
  await step($, undefined, 'agent-1')

  expect(await modelSegment($, 'desktop')).toBe('Opus 5.5 (200K) medium')
})

test('a /model switch to a model without effort clears it', async ($, on) => {
  const { switchModel } = engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'desktop', isInteractive: true })
  await step($, 'medium')

  switchModel('claude-haiku-5-5')
  await step($, undefined)
  expect(await modelSegment($, 'desktop')).toBe('Haiku 5.5 (200K) –')
})

test('a session nothing draws skips the work, git included', async ($, on) => {
  const { calls } = engine(on, [])
  await $.session.start({ cwd: '/work/myproj', surface: null, isInteractive: false })

  expect(calls.git).toBe(0)
})

test('band yields to a survey', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({ plugin: 'pace-line', surface: 'terminal', ...BAND, props: { ...BAND.props, hasSurvey: true } })
  expect(await ui.find({ type: 'Text', text: /myproj/ })).toBeUndefined()
  await ui.unmount()
})

test('surfaces: desktop hides the band in the terminal only', { options: { surfaces: 'desktop' } }, async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'desktop', isInteractive: true })

  expect(await modelSegment($, 'terminal')).toBeUndefined()
  expect(await modelSegment($, 'desktop')).toBe('Opus 5.5 (200K) –')
})

test('surfaces: terminal hides the band on desktop only', { options: { surfaces: 'terminal' } }, async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'terminal', isInteractive: true })

  expect(await modelSegment($, 'desktop')).toBeUndefined()
  expect(await modelSegment($, 'terminal')).toBe('Opus 5.5 (200K) –')
})

test('surfaces: desktop skips the work in a terminal-only session', { options: { surfaces: 'desktop' } }, async ($, on) => {
  const { calls } = engine(on, ['terminal'])
  await $.session.start({ cwd: '/work/myproj', surface: 'terminal', isInteractive: true })

  expect(calls.git).toBe(0)
})

test('showModel: false draws line 1 without the model column', { options: { showModel: false } }, async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'terminal', isInteractive: true })
  await step($, 'medium')

  expect(await modelSegment($, 'terminal')).toBeUndefined()
  const ui = await $.ui.mount({ plugin: 'pace-line', surface: 'terminal', ...BAND })
  expect(await ui.find({ type: 'Text', text: 'myproj (main)' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '⇣15%' })).toBeDefined()
  await ui.unmount()
})
