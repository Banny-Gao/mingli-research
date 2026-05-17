import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gold' | 'green' | 'red'
}

const variants = {
  default: 'border border-[var(--color-border)] text-[var(--color-text-dim)]',
  gold: 'border border-[var(--color-gold)]/30 text-[var(--color-gold)] bg-[var(--color-gold)]/10',
  green: 'border border-[#60c060]/30 text-[#60c060] bg-[#60c060]/10',
  red: 'border border-[#d05050]/30 text-[#d05050] bg-[#d05050]/10',
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return <span className={cn('inline-block text-[10px] px-1.5 py-0.5 rounded-sm', variants[variant], className)}>{children}</span>
}
