import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const NOW = 1_800_000_000_000
const BAND = { component: 'AbovePrompt', props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 4,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 2 },
    view: {},
  },
} as const

// Stands in for the engine beneath the mod: attached surfaces, session figures, env, git.
function engine(on: On, surfaces: readonly ('terminal' | 'desktop')[] = ['terminal', 'desktop']) {
  const calls = { git: 0 }
  on('session.surfaces', () => ({ value: surfaces }))
  mock.clock(on, { now: NOW })
  mock.env(on, { HOME: '/Users/me' })
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
  on('session.root', () => ({ value: '/work/myproj' }))
  on('process.run', (_$, e) => {
    calls.git += 1
    const args = e.argv.slice(4).join(' ')
    const stdout = args === 'branch --show-current' ? 'main\n' : args === 'diff HEAD --numstat' ? '4\t2\ta.ts\n' : '.git\n'
    return { value: { exitCode: 0, stdout, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  // Nothing beneath the mod draws in a test: stand in for the engine's own band.
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  return calls
}

test('band draws both lines with the status colors on desktop', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'desktop', isInteractive: true })

  {
    const ui = await $.ui.mount({ plugin: 'pace-line', surface: 'desktop', ...BAND })
    expect(await ui.find({ type: 'Text', text: /Opus|high/ })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: 'myproj (main)' })).toBeDefined()
    expect((await ui.find({ type: 'Text', text: '+4' }))?.props.color).toBe('green')
    expect((await ui.find({ type: 'Text', text: '█████████░' }))?.props.color).toBe('red')
    expect((await ui.find({ type: 'Text', text: '⇣15%' }))?.props.color).toBe('green')
    expect((await ui.find({ type: 'Text', text: '⇡9%' }))?.props.color).toBe('red')
    await ui.unmount()
  }
})

test('terminal gets no band (statusline.sh covers it)', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({ plugin: 'pace-line', surface: 'terminal', ...BAND })
  expect(await ui.find({ type: 'Text', text: /myproj/ })).toBeUndefined()
  await ui.unmount()
})

test('terminal-only session skips the work, git included', async ($, on) => {
  const calls = engine(on, ['terminal'])
  await $.session.start({ cwd: '/work/myproj', surface: 'terminal', isInteractive: true })

  expect(calls.git).toBe(0)
})

test('band yields to a survey', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/work/myproj', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ plugin: 'pace-line', surface: 'desktop', ...BAND, props: { ...BAND.props, hasSurvey: true } })
  expect(await ui.find({ type: 'Text', text: /myproj/ })).toBeUndefined()
  await ui.unmount()
})
