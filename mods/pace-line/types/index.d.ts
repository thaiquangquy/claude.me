export type GitInfo = {
  branch: string
  files: number
  added: number
  deleted: number
}

// The effort the last main-loop model request carried, keyed by the session
// model at that moment; level null for a model without effort.
export type EffortRecord = { sessionModel: string; level: string | number | null }

export type Color = 'cyan' | 'green' | 'yellow' | 'red'
export type Segment = { text: string; color?: Color; dim?: boolean }
export type Line = Segment[]

declare module 'claude-code' {
  interface PluginState {
    'pace-line': {
      // Effort of the last main-loop model request; null before the first one.
      effort: EffortRecord | null
      // The two rendered lines; null until the first refresh.
      lines: Line[] | null
    }
  }
}
