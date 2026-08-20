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

/*
 * The network canvas carries the hero's actual motion argument (a message
 * reaching an answer instantly); the particle field above it stays as a
 * quieter sparkle layer for depth. Both mount independently so a slow chunk
 * for one never blocks the other.
 */
const HeroNetworkCanvas = dynamic(
  () => import('./HeroNetworkCanvas').then((mod) => mod.HeroNetworkCanvas),
  { ssr: false },
)

export function HeroMotion() {
  return (
    <>
      <HeroNetworkCanvas />
      <HeroBackdrop />
    </>
  )
}
