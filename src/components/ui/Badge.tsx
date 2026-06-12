interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info'
}

const badgeVariants = {
  default: 'bg-surface-800 text-surface-300 border-surface-700',
  success: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
  warning: 'bg-surface-600/30 text-surface-300 border-surface-500/30',
  info: 'bg-surface-700/30 text-surface-400 border-surface-600/30',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeVariants[variant]}`}
    >
      {children}
    </span>
  )
}
