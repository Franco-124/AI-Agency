'use client'

import { useEffect, type CSSProperties } from 'react'

import { prefersReducedMotion } from '@/lib/motion'
import { sectionIds } from '@/lib/site'

/**
 * Ambient hero motion: a slow particle field only. An earlier version also
 * drew a diagonal orange "beam" across the hero — dropped because it was pure
 * abstraction with no relationship to WhatsApp, agendas or any of the five
 * verticals; the hero's actual argument now lives in the chat card beside the
 * copy. What remains here must never loop fast enough to compete with it.
 */

type Particle = {
  /** Percentages of the hero box. */
  left: number
  top: number
  size: number
  /** Seconds. Long durations are the whole point — this must never read fast. */
  duration: number
  delay: number
  /** Horizontal drift over the full rise, in pixels. */
  drift: number
  opacity: number
}

/*
 * A fixed field rather than random values: the layout is art-directed (nothing
 * sits behind the headline's first lines), it is identical on every visit, and
 * it costs no runtime randomness.
 */
const particles: readonly Particle[] = [
  { left: 6, top: 72, size: 5, duration: 44, delay: 0, drift: 18, opacity: 0.46 },
  { left: 13, top: 88, size: 4, duration: 52, delay: 7, drift: -12, opacity: 0.38 },
  { left: 21, top: 64, size: 5, duration: 38, delay: 14, drift: 22, opacity: 0.42 },
  { left: 28, top: 94, size: 7, duration: 48, delay: 3, drift: -20, opacity: 0.36 },
  { left: 35, top: 78, size: 4, duration: 41, delay: 20, drift: 14, opacity: 0.44 },
  { left: 43, top: 90, size: 6, duration: 55, delay: 11, drift: -16, opacity: 0.4 },
  { left: 51, top: 68, size: 5, duration: 36, delay: 24, drift: 20, opacity: 0.48 },
  { left: 58, top: 84, size: 8, duration: 50, delay: 5, drift: -24, opacity: 0.34 },
  { left: 64, top: 58, size: 4, duration: 43, delay: 17, drift: 12, opacity: 0.46 },
  { left: 71, top: 92, size: 6, duration: 46, delay: 9, drift: -18, opacity: 0.42 },
  { left: 77, top: 70, size: 5, duration: 39, delay: 27, drift: 16, opacity: 0.44 },
  { left: 83, top: 86, size: 7, duration: 53, delay: 2, drift: -14, opacity: 0.36 },
  { left: 88, top: 62, size: 4, duration: 37, delay: 22, drift: 20, opacity: 0.48 },
  { left: 94, top: 80, size: 6, duration: 49, delay: 13, drift: -22, opacity: 0.4 },
  { left: 17, top: 52, size: 4, duration: 57, delay: 30, drift: 10, opacity: 0.34 },
  { left: 47, top: 48, size: 5, duration: 51, delay: 34, drift: -10, opacity: 0.32 },
  { left: 68, top: 44, size: 4, duration: 59, delay: 26, drift: 14, opacity: 0.34 },
  { left: 90, top: 40, size: 5, duration: 45, delay: 38, drift: -12, opacity: 0.36 },
]

/**
 * Pauses every ambient animation in the hero while the hero is off screen.
 *
 * The verdict is written as `data-hero-motion` on the hero `<section>` — this
 * component's own ancestor — rather than on a wrapper here, because the two
 * `mix-blend-screen` side visuals are siblings of this layer and they, not the
 * particles, are the expensive half. A blended layer forces the compositor to
 * re-read what is painted beneath it every frame, and `soft-float` is
 * `infinite`, so that read went on for the whole visit while the visitor was
 * reading a section ten screens away.
 *
 * Three deliberate choices:
 *
 * - **A raw IntersectionObserver, not `useInView`.** The hook stores the
 *   verdict in React state, so every enter and leave re-renders the eighteen
 *   particle spans. Nothing about them depends on it — only a CSS attribute
 *   does — so the render is pure waste.
 * - **Written straight to the DOM**, for the same reason.
 * - **Not `observeOnce`**, which is one-shot by contract; this one has to keep
 *   reporting both directions.
 * - **Resolved by `id`, not by a ref on this component's own tree.** The gate
 *   has to keep working when the particle field itself renders nothing —
 *   under reduced motion this component returns `null`, so a ref would never
 *   be attached and the side visuals would be left running. They are the
 *   expensive half, so the gate must not depend on the cheap half existing.
 */
function useHeroMotionGate() {
  useEffect(() => {
    const section = document.getElementById(sectionIds.hero)

    if (!section || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        section.dataset.heroMotion = entry?.isIntersecting ? 'running' : 'paused'
      },
      { threshold: 0 },
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
      delete section.dataset.heroMotion
    }
  }, [])
}

export function HeroBackdrop() {
  useHeroMotionGate()

  /*
   * Read straight from `matchMedia` rather than through a subscribing hook.
   * This component is `ssr: false` and mounted after hydration, so there is no
   * server render to keep in step, and a visitor does not flip this setting
   * mid-visit often enough to be worth a re-render path.
   *
   * The gate above runs either way — see its note on why it does not hang off
   * a ref in this tree.
   */
  if (prefersReducedMotion()) {
    return null
  }

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="particle"
            style={
              {
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                '--particle-duration': `${particle.duration}s`,
                '--particle-delay': `-${particle.delay}s`,
                '--particle-drift': `${particle.drift}px`,
                '--particle-opacity': particle.opacity,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}
