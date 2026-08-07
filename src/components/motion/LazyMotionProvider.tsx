'use client'

import { LazyMotion } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Loads the DOM animation features on demand instead of bundling them into the
 * initial payload. Components under this provider must use `m.*` rather than
 * `motion.*`, which is what `strict` enforces at development time.
 */
const loadFeatures = () =>
  import('motion/react').then((mod) => mod.domAnimation)

export function LazyMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  )
}
