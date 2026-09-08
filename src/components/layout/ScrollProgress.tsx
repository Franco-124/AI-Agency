'use client'

import { useEffect, useRef } from 'react'

/**
 * Page scroll indicator: a 2px accent line pinned to the top of the viewport.
 *
 * The bar is `position: fixed` and only ever animates `transform`, so it is
 * outside the document flow and cannot contribute to layout shift. Progress is
 * written straight to the DOM node from a rAF-throttled scroll listener instead
 * of React state, to avoid re-rendering the tree on every scroll frame.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let frame = 0

    const update = () => {
      frame = 0
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      bar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      {/*
        A gradient rather than a flat fill, brightening toward the leading
        edge, plus a soft glow. A flat 2px band is the default every framework
        ships; the lit edge makes the bar read as something advancing.
      */}
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-[linear-gradient(to_right,var(--color-acento-deep)_0%,var(--color-acento)_60%,var(--color-acento-lift)_100%)] shadow-[0_0_10px_color-mix(in_srgb,var(--color-acento)_60%,transparent)]"
      />
    </div>
  )
}
