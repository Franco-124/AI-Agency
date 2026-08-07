'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Stagger helper — delay in seconds. */
  delay?: number
  as?: ElementType
}

/** Runs before paint on the client, no-ops during SSR. */
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Scroll reveal used across every section: 12px slide + fade, once.
 *
 * Built on IntersectionObserver + CSS transitions rather than an animation
 * library, so the critical JS bundle stays small. Content renders *visible* on
 * the server and is only hidden right before paint when it is below the fold —
 * without JavaScript nothing is ever hidden, and above-the-fold content never
 * animates on load.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Component = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [isHidden, setIsHidden] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const node = ref.current

    if (!node || typeof IntersectionObserver === 'undefined') return
    if (node.getBoundingClientRect().top < window.innerHeight) return

    setIsHidden(true)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHidden(false)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -64px 0px', threshold: 0.01 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Component
      ref={ref}
      style={{ transitionDelay: delay ? `${delay}s` : undefined }}
      className={cn(
        'transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]',
        isHidden ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100',
        className,
      )}
    >
      {children}
    </Component>
  )
}
