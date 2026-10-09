export type GitInfo = {
  branch: string
  files: number
  added: number
  deleted: number
}

export type Color = 'cyan' | 'green' | 'yellow' | 'red'
export type Segment = { text: string; color?: Color; dim?: boolean }
export type Line = Segment[]

declare module 'claude-code' {
  interface PluginState {
    'pace-line': {
      // The two rendered lines; null until the first refresh.
      lines: Line[] | null
    }
  }
}
