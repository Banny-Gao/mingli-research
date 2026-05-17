import React from 'react'

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  padding: '6px 10px',
  color: 'var(--color-text-body)',
  fontSize: 13,
  cursor: 'pointer',
}

export const Select: React.FC<Props> = ({ style, children, ...rest }) => (
  <select style={{ ...selectStyle, ...style }} {...rest}>
    {children}
  </select>
)
