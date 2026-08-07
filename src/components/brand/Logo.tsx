import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import { NumiMark } from './NumiMark'
import { Wordmark } from './Wordmark'

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
      <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
        <span aria-hidden className="mark-halo" />
        <NumiMark className="relative h-7 w-7 text-[var(--color-acento)] transition-transform duration-300 group-hover:rotate-[18deg]" />
      </span>
      <Wordmark />
      {/* Visible text stays the accessible name; this only adds the destination. */}
      <span className="sr-only">{label}</span>
    </Link>
  )
}
