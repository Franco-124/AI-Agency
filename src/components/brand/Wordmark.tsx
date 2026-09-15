import { cn } from '@/lib/utils'

/**
 * The "Numi AI" lettering. Kept as one component so the header and the footer
 * can never drift apart: the sheen, the tracking and the muted suffix all live
 * in `.wordmark` (see `globals.css`).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    /*
      Set in the body face, not the display face.

      It followed `--font-display` while that was a geometric sans, but the
      display face is now a serif — and a five-letter mark set in uppercase
      serif reads as a masthead, which competes with the headline directly
      beneath it in the same face. The sans keeps the mark as an identifier and
      leaves the serif to say the one thing the page is actually arguing.

      Tracking stays at 0.06em rather than the body face's 0.14em: at that
      width the letters read as separated characters instead of a mark, and a
      wordmark has to hold together as one shape.
    */
    <span
      className={cn(
        'wordmark font-sans text-[1rem] font-semibold uppercase tracking-[0.06em]',
        className,
      )}
    >
      Numi<span className="wordmark-suffix"> AI</span>
    </span>
  )
}
