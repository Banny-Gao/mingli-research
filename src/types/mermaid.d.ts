declare module 'mermaid' {
  interface MermaidConfig {
    startOnLoad?: boolean
    theme?: string
    themeVariables?: Record<string, string>
    [key: string]: any
  }
  interface RunOptions {
    nodes: Array<{ id: string; node: HTMLElement }>
    suppressErrors?: boolean
  }
  function initialize(config: MermaidConfig): void
  function run(options: RunOptions): Promise<void>
  export default { initialize, run }
}
