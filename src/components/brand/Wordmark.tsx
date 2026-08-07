import { cn } from '@/lib/utils'

/**
 * The "Numi AI" lettering. Kept as one component so the header and the footer
 * can never drift apart: the sheen, the tracking and the muted suffix all live
 * in `.wordmark` (see `globals.css`).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'wordmark text-[0.9375rem] font-semibold tracking-[0.14em] uppercase',
        className,
      )}
    >
      Numi<span className="wordmark-suffix"> AI</span>
    </span>
  )
}
