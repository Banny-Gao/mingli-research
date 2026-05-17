import React from 'react'

type Variant = 'default' | 'primary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default: { borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' },
  primary: { borderColor: 'var(--color-purple)', color: 'var(--color-purple-light)' },
  danger: { borderColor: '#d0505066', color: '#d05050' },
  ghost: { border: 'none', color: 'var(--color-text-muted)', padding: 0 },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { fontSize: 12, padding: '4px 8px' },
  md: { fontSize: 13, padding: '6px 12px' },
}

const baseStyle: React.CSSProperties = {
  background: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: '1px solid',
  lineHeight: 1.5,
}

export const Button: React.FC<Props> = ({ variant = 'default', size = 'md', style, children, ...rest }) => (
  <button
    style={{ ...baseStyle, ...variantStyles[variant], ...sizeStyles[size], ...style }}
    {...rest}
  >
    {children}
  </button>
)
