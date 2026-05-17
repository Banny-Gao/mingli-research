import React from 'react'

interface Props {
  children: React.ReactNode
  color?: string
  bg?: string
  border?: string
}

export const Badge: React.FC<Props> = ({ children, color = 'var(--color-text-dim)', bg = 'transparent', border = 'var(--color-border)' }) => (
  <span
    style={{
      fontSize: 10,
      padding: '1px 6px',
      borderRadius: 3,
      background: bg,
      color,
      border: `1px solid ${border}`,
    }}
  >
    {children}
  </span>
)
