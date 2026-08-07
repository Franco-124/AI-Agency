'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { observeOnce, prefersReducedMotion } from '@/lib/motion'

/** Runs before paint on the client, no-ops during SSR. */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * `undefined` — no animation applies: server render, no observer support,
 * reduced motion, or already on screen for an effect that must not replay.
 * `pending` — hidden, waiting to be scrolled into view.
 * `in`      — playing / played.
 */
export type TriggerState = 'pending' | 'in' | undefined

type Options = {
  rootMargin?: string
  threshold?: number
  /**
   * What to do when the element is already inside the viewport on first paint.
   * `false` (default) opts out of the animation entirely — above-the-fold
   * content must not fade in on load. `true` plays it straight away, which is
   * what an in-place effect (a line drawing itself) wants.
   */
  playOnLoad?: boolean
}

/**
 * Drives a CSS-only scroll animation from a single pooled IntersectionObserver.
 *
 * The state is exposed as a `data-*` value rather than class names so the whole
 * animation lives in the stylesheet: no animation library on the critical path,
 * and one paint-time state change per element instead of a re-render per frame.
 *
 * Content is rendered *visible* on the server and only hidden right before paint
 * when it sits below the fold — without JavaScript nothing is ever hidden.
 */
export function useScrollTrigger<T extends HTMLElement>({
  rootMargin = '0px 0px -64px 0px',
  threshold = 0.01,
  playOnLoad = false,
}: Options = {}) {
  const ref = useRef<T>(null)
  const [state, setState] = useState<TriggerState>(undefined)

  useIsomorphicLayoutEffect(() => {
    const node = ref.current

    if (!node || typeof IntersectionObserver === 'undefined') return
    if (prefersReducedMotion()) return

    if (node.getBoundingClientRect().top < window.innerHeight) {
      if (!playOnLoad) return

      /*
       * Already on screen. Pin the start state, then release it on the next
       * frame: flipping both in the same commit gives the browser no painted
       * "before" value, so the transition would be skipped entirely.
       */
      setState('pending')
      const frame = requestAnimationFrame(() => setState('in'))

      return () => cancelAnimationFrame(frame)
    }

    setState('pending')

    return observeOnce(node, () => setState('in'), { rootMargin, threshold })
  }, [rootMargin, threshold, playOnLoad])

  return { ref, state }
}
