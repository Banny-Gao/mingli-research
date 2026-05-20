import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

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

const Mermaid: React.FC<Props> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!ref.current || !children) return
    const id = 'mermaid-' + Math.random().toString(36).slice(2, 8)
    mermaid
      .run({
        nodes: [{ id, node: ref.current } as any],
        suppressErrors: true,
      })
      .catch(() => setError(true))
  }, [children])

  if (error)
    return (
      <pre
        className="mermaid-error"
        style={{ color: '#e06c75', padding: 12, border: '1px solid #e06c7544', borderRadius: 6 }}
      >
        <code>{children}</code>
      </pre>
    )

  return (
    <div className="mermaid-wrapper" style={{ overflow: 'auto', padding: '12px 0' }}>
      <div ref={ref} className="mermaid">
        {children}
      </div>
    </div>
  )
}

export default Mermaid
