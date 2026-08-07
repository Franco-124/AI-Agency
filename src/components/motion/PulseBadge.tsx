import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PulseBadgeProps = {
  children: ReactNode
  className?: string
}

/**
 * "Más elegido" badge with a slow breathing scale (1 ↔ 1.03, 2s loop).
 * Pure CSS, so it costs no JavaScript and the global `prefers-reduced-motion`
 * rule freezes it automatically.
 */
export function PulseBadge({ children, className }: PulseBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex origin-center items-center gap-2 rounded-full bg-[var(--color-acento)] px-3.5 py-1.5',
        'text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-neutro-oscuro)]',
        'animate-[badge-breath_2s_ease-in-out_infinite] will-change-transform',
        className,
      )}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-[var(--color-neutro-oscuro)]"
      />
      {children}
    </span>
  )
}
