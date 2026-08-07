'use client'

import { useEffect, useRef } from 'react'

type CountUpProps = {
  /** Final rendered string, e.g. "+40%". Digits are the part that animates. */
  value: string
  /** Duration in milliseconds. */
  duration?: number
  className?: string
}

const DIGITS = /\d+/

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/**
 * Counts a figure up to its final value exactly once, the first time it scrolls
 * into view.
 *
 * Runs at most once per mount: the observer is disconnected on the first
 * intersection and a ref latches the completed state, so scrolling back and
 * forth over the section can never restart or rewind the number. Any early
 * teardown (React Strict Mode's double effect, Fast Refresh, unmount mid-count)
 * pins the final value rather than leaving a partial one on screen.
 *
 * The ticking value is written straight to the DOM instead of React state, so
 * the tree is not re-rendered on every animation frame. Layout is reserved from
 * the first paint by rendering the final string invisibly in the same grid cell
 * — the count can never shift the page.
 */
export function CountUp({ value, duration = 1000, className }: CountUpProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const valueRef = useRef<HTMLSpanElement>(null)
  const hasRunRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    const node = valueRef.current

    if (!root || !node) return

    const settle = () => {
      node.textContent = value
    }

    // Already counted on a previous pass — never animate a second time.
    if (hasRunRef.current) {
      settle()
      return
    }

    const match = value.match(DIGITS)
    const canAnimate =
      match !== null &&
      typeof IntersectionObserver !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!canAnimate) {
      settle()
      return
    }

    const target = Number(match[0])
    const pad = match[0].length
    const render = (n: number) =>
      value.replace(DIGITS, String(n).padStart(pad, '0').slice(-pad))

    let frame = 0
    let start: number | null = null

    const step = (timestamp: number) => {
      start ??= timestamp
      const progress = Math.min((timestamp - start) / duration, 1)

      if (progress >= 1) {
        frame = 0
        hasRunRef.current = true
        settle()
        return
      }

      node.textContent = render(Math.round(easeOutCubic(progress) * target))
      frame = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        node.textContent = render(0)
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(root)

    return () => {
      observer.disconnect()

      if (frame) {
        cancelAnimationFrame(frame)
        // Torn down mid-count: land on the final value, never a partial one.
        hasRunRef.current = true
        settle()
      }
    }
  }, [value, duration])

  return (
    <span ref={rootRef} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-grid tabular-nums">
        {/* Reserves the final width from the first paint — no layout shift. */}
        <span className="invisible col-start-1 row-start-1">{value}</span>
        <span ref={valueRef} className="col-start-1 row-start-1">
          {value}
        </span>
      </span>
    </span>
  )
}
