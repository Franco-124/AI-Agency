'use client'

import { useEffect, useRef } from 'react'

/**
 * Page scroll indicator: a 2px accent line pinned to the top of the viewport.
 *
 * The bar is `position: fixed` and only ever animates `transform`, so it is
 * outside the document flow and cannot contribute to layout shift. Progress is
 * written straight to the DOM node from a rAF-throttled scroll listener instead
 * of React state, to avoid re-rendering the tree on every scroll frame.
 *
 * The scrollable distance is cached rather than read per frame. Reading
 * `scrollHeight` forces the browser to flush layout synchronously, and doing
 * that inside a scroll frame is the textbook cause of scroll jank — while
 * scrolling, the value it returns has not changed. A `ResizeObserver` on the
 * document element refreshes it when the page's height actually moves, which
 * covers late images, webfonts and any section that expands.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let frame = 0
    let scrollable = 0

    const measure = () => {
      scrollable = document.documentElement.scrollHeight - window.innerHeight
    }

    const update = () => {
      frame = 0
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      bar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    const onResize = () => {
      measure()
      onScroll()
    }

    measure()
    update()

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            measure()
          })

    resizeObserver?.observe(document.documentElement)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
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
