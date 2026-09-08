import { cn } from '@/lib/utils'

/**
 * The "Numi AI" lettering. Kept as one component so the header and the footer
 * can never drift apart: the sheen, the tracking and the muted suffix all live
 * in `.wordmark` (see `globals.css`).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    /*
      Set in the display face at 0.06em rather than the body face at 0.14em.
      At that tracking the five letters read as separated characters instead of
      a mark — a wordmark has to hold together as one shape, and letter-spacing
      wide enough to be a "style" is what stops it doing so.
    */
    <span
      className={cn(
        'wordmark font-display text-[1rem] font-semibold uppercase tracking-[0.06em]',
        className,
      )}
    >
      Numi<span className="wordmark-suffix"> AI</span>
    </span>
  )
}
