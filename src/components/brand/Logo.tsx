import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import { NumiMark } from './NumiMark'

type LogoProps = {
  className?: string
  /** Suffix appended to the visible wordmark for the accessible name. */
  label: string
}

export function Logo({ className, label }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2.5 rounded-sm', className)}
    >
      <NumiMark className="h-7 w-7 text-[var(--color-acento)] transition-transform duration-200 group-hover:rotate-12" />
      <span className="text-[0.9375rem] font-semibold tracking-[0.14em] text-ink uppercase">
        Numi<span className="text-ink-faint"> AI</span>
      </span>
      {/* Visible text stays the accessible name; this only adds the destination. */}
      <span className="sr-only">{label}</span>
    </Link>
  )
}
