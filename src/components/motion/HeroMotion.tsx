'use client'

import dynamic from 'next/dynamic'

/**
 * The animated hero layer is purely decorative, so it is code-split and loaded
 * after hydration. This keeps the animation library out of the critical path —
 * the static hero image is what the LCP measurement sees.
 */
const HeroBackdrop = dynamic(
  () => import('./HeroBackdrop').then((mod) => mod.HeroBackdrop),
  { ssr: false },
)

export function HeroMotion() {
  return <HeroBackdrop />
}
