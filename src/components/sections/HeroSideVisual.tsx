import Image, { type StaticImageData } from 'next/image'

import { cn } from '@/lib/utils'

type HeroSideVisualProps = {
  src: StaticImageData
  /** Extra classes for placement — absolute on desktop, in-flow on mobile. */
  className?: string
  /** Staggers the float so the two visuals never breathe in lockstep. */
  floatDelay?: string
}

/**
 * One of the hero's two flanking product visuals.
 *
 * The artwork is used as-is rather than rebuilt in DOM nodes, so the cards,
 * copy and connectors are exactly the approved comp. Its field is near-black,
 * and `mix-blend-screen` drops that field into the hero background: black
 * contributes nothing under screen, so the image has no edge to see and reads
 * as lit from within the page rather than pasted on top of it.
 *
 * The blend mode has to live on this outer element, not on the `img`. Both the
 * float animation and the centring offset set `transform`/`translate`, which
 * makes this element a stacking context — an `img` inside it would be isolated
 * from the page and would blend against nothing, rendering as an opaque
 * rectangle. Keep the blend and the transforms on the same element.
 *
 * The webp sources are pre-un-screened against each image's own field colour,
 * which is also the hero's base colour — see the note on the base layer in
 * `Hero` — which is why they must not be swapped back for the raw PNGs.
 */
export function HeroSideVisual({ src, className, floatDelay }: HeroSideVisualProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none select-none soft-float mix-blend-screen',
        className,
      )}
      style={floatDelay ? { animationDelay: floatDelay } : undefined}
    >
      <Image
        src={src}
        alt=""
        priority
        sizes="(min-width: 1536px) 25rem, (min-width: 1024px) 24vw, 45vw"
        className="h-auto w-full"
      />
    </div>
  )
}
