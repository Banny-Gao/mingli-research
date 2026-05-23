import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import './Mermaid.less'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1a1a3e',
    primaryTextColor: '#e0d0a0',
    primaryBorderColor: '#7a4faa',
    lineColor: '#f0c060',
    secondaryColor: '#0a0a20',
    tertiaryColor: '#1a1a2e',
  },
})

interface Props {
  children: string
}

const Mermaid = ({ children }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

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
