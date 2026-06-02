/**
 * Design tokens — single source of truth for color, typography, spacing,
 * radius, and shadow scales. CSS variables in src/styles/index.css mirror
 * these values; update both together when changing a token.
 */

export const color = {
  bg: {
    base: 'var(--color-bg-base)',
    card: 'var(--color-bg-card)',
    cardHover: 'var(--color-bg-card-hover)',
  },
  border: {
    DEFAULT: 'var(--color-border)',
    card: 'var(--color-border-card)',
    hover: 'var(--color-border-hover)',
  },
  gold: 'var(--color-gold)',
  goldDim: 'var(--color-gold-dim)',
  goldGlow: 'var(--color-gold-glow)',
  purple: 'var(--color-purple)',
  purpleLight: 'var(--color-purple-light)',
  purpleBg: 'var(--color-purple-bg)',
  text: {
    body: 'var(--color-text-body)',
    dim: 'var(--color-text-dim)',
    muted: 'var(--color-text-muted)',
    title: 'var(--color-text-title)',
  },
  green: 'var(--color-green)',
  blue: 'var(--color-blue)',
} as const

export const typography = {
  xs: 'var(--text-xs)',
  sm: 'var(--text-sm)',
  md: 'var(--text-md)',
  base: 'var(--text-base)',
  lg: 'var(--text-lg)',
  xl: 'var(--text-xl)',
  '2xl': 'var(--text-2xl)',
} as const

export const spacing = {
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
  10: 'var(--space-10)',
  12: 'var(--space-12)',
  16: 'var(--space-16)',
} as const

export const radius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  '3xl': 'var(--radius-3xl)',
  '4xl': 'var(--radius-4xl)',
} as const

export const shadow = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  glow: 'var(--shadow-glow)',
  purple: 'var(--shadow-purple)',
} as const

export type Color = typeof color
export type Typography = typeof typography
export type Spacing = typeof spacing
export type Radius = typeof radius
export type Shadow = typeof shadow
