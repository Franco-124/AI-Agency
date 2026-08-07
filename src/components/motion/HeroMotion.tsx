'use client'

import dynamic from 'next/dynamic'

/**
 * The animated hero layer is purely decorative, so it is code-split and loaded
 * after hydration. This keeps the animation library out of the critical path —
 * the static hero image is what the LCP measurement sees.
 */
const SparkBackdrop = dynamic(
  () => import('./SparkBackdrop').then((mod) => mod.SparkBackdrop),
  { ssr: false },
)

export function HeroMotion() {
  return <SparkBackdrop />
}
