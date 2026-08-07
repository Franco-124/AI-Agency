'use client'

import { motion, useReducedMotion } from 'motion/react'

const BEAM_START = { x: -40, y: 260 }
const BEAM_END = { x: 1480, y: 40 }

/**
 * Hero brand motion: a single spark travelling along a shallow diagonal.
 *
 * The whole SVG is confined to a band at the bottom of the hero by its wrapper,
 * so the beam can never cross the headline at any breakpoint — legibility of
 * the copy always wins over the decoration.
 */
export function SparkBackdrop() {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return null
  }

  return (
    <svg
      viewBox="0 0 1440 300"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="numi-beam" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-acento)" stopOpacity="0" />
          <stop offset="40%" stopColor="var(--color-acento)" stopOpacity="0.55" />
          <stop offset="65%" stopColor="var(--color-acento)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-acento)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="numi-spark-halo">
          <stop offset="0%" stopColor="var(--color-acento)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-acento)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The beam draws itself once on load, then stays. */}
      <motion.line
        x1={BEAM_START.x}
        y1={BEAM_START.y}
        x2={BEAM_END.x}
        y2={BEAM_END.y}
        stroke="url(#numi-beam)"
        strokeWidth={1.5}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
      />

      <motion.g
        initial={{ x: BEAM_START.x, y: BEAM_START.y, opacity: 0 }}
        animate={{
          x: [BEAM_START.x, BEAM_END.x],
          y: [BEAM_START.y, BEAM_END.y],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 6.5,
          times: [0, 0.12, 0.88, 1],
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 2.5,
          delay: 1.2,
        }}
      >
        <circle r={40} fill="url(#numi-spark-halo)" />
        <circle r={2.5} fill="var(--color-neutro-claro)" />
      </motion.g>
    </svg>
  )
}
