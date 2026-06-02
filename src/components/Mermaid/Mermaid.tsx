import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import './Mermaid.less'

const readToken = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

interface Props {
  children: string
}

const Mermaid = ({ children }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  // Re-init mermaid when theme changes so themeVariables track data-theme
  useEffect(() => {
    const init = () => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: readToken('--color-mermaid-bg'),
          primaryTextColor: readToken('--color-mermaid-text'),
          primaryBorderColor: readToken('--color-purple'),
          lineColor: readToken('--color-mermaid-line'),
          secondaryColor: readToken('--color-mermaid-bg-alt'),
          tertiaryColor: readToken('--color-mermaid-bg-secondary'),
        },
      })
    }
    init()
    const observer = new MutationObserver(init)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!ref.current || !children) return
    ;(mermaid.run as (opts: unknown) => Promise<void>)({
      nodes: [ref.current],
      suppressErrors: true,
    })
      .then(() => setError(false))
      .catch(() => setError(true))
  }, [children])

  if (error)
    return (
      <pre className="mermaid-error">
        <code>{children}</code>
      </pre>
    )

  return (
    <div className="mermaid-wrapper">
      <div ref={ref} className="mermaid">
        {children}
      </div>
    </div>
  )
}

export default Mermaid
