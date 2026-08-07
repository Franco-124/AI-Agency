'use client'

import type { CSSProperties, ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { useScrollTrigger } from './useScrollTrigger'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Stagger helper — delay in seconds. */
  delay?: number
  as?: ElementType
}

/**
 * Scroll reveal used across every section: 12px slide + fade, once.
 *
 * Built on a pooled IntersectionObserver plus a CSS transition rather than an
 * animation library, so the critical JS bundle stays small and every reveal on
 * the page shares one observer. The visual contract lives in `globals.css`
 * under `[data-reveal]`.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Component = 'div',
}: RevealProps) {
  const { ref, state } = useScrollTrigger<HTMLElement>()

  return (
    <Component
      ref={ref}
      data-reveal={state}
      style={
        delay ? ({ '--reveal-delay': `${delay}s` } as CSSProperties) : undefined
      }
      className={cn(className)}
    >
      {children}
    </Component>
  )
}
