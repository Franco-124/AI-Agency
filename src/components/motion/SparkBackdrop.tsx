'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'

/**
 * The hero carries two orange diagonals: the one painted into the photograph,
 * and the shallower beam this component draws across the bottom band. Sparks
 * run on both, in both directions, so each line reads as a circuit carrying
 * something rather than as a static graphic.
 */

type Point = { x: number; y: number }

type Trail = {
  id: string
  from: Point
  to: Point
  delay: number
  radius: number
  halo: number
}

/** One full pass plus the pause that follows it. */
const TRAVEL_DURATION = 6.5
const TRAVEL_GAP = 2.5
const CYCLE = TRAVEL_DURATION + TRAVEL_GAP

/*
 * Layer 1 — the photograph's diagonal.
 *
 * To ride a line that lives inside the image, the overlay has to be cropped
 * exactly like the image: same intrinsic aspect ratio in the viewBox, and
 * `xMidYMid slice`, which is the SVG equivalent of `object-cover object-center`.
 * Coordinates are therefore pixel positions in the source file, and they land on
 * the line at every viewport.
 *
 * The line exits the left edge at y≈857 and the top edge at x≈1243. Both ends
 * are extended past the frame so a spark is never born or killed on screen.
 */
const PHOTO_WIDTH = 1536
const PHOTO_HEIGHT = 1024
const PHOTO_START: Point = { x: -80, y: 912 }
const PHOTO_END: Point = { x: 1330, y: -60 }

const photoTrails: readonly Trail[] = [
  { id: 'photo-up', from: PHOTO_START, to: PHOTO_END, delay: 1.4, radius: 3, halo: 46 },
  {
    id: 'photo-down',
    from: PHOTO_END,
    to: PHOTO_START,
    delay: 1.4 + CYCLE / 2,
    // Slightly smaller: the returning spark is the echo, not the headline.
    radius: 2.4,
    halo: 38,
  },
]

/*
 * Layer 2 — the drawn beam, confined to the bottom band of the hero so it can
 * never cross the headline at any breakpoint.
 */
const BEAM_WIDTH = 1440
const BEAM_HEIGHT = 300
const BEAM_START: Point = { x: -40, y: 260 }
const BEAM_END: Point = { x: 1480, y: 40 }

/* Offset from the photo layer so the two lines never pulse in lockstep. */
const BEAM_PHASE = 2.6

const beamTrails: readonly Trail[] = [
  { id: 'beam-up', from: BEAM_START, to: BEAM_END, delay: BEAM_PHASE, radius: 2.5, halo: 40 },
  {
    id: 'beam-down',
    from: BEAM_END,
    to: BEAM_START,
    delay: BEAM_PHASE + CYCLE / 2,
    radius: 2,
    halo: 32,
  },
]

type SparksProps = {
  trails: readonly Trail[]
  /** Paused off screen — see the note in `SparkBackdrop`. */
  isInView: boolean
}

function Sparks({ trails, isInView }: SparksProps) {
  return trails.map(({ id, from, to, delay, radius, halo }) => (
    <motion.g
      key={id}
      initial={{ x: from.x, y: from.y, opacity: 0 }}
      animate={
        isInView
          ? { x: [from.x, to.x], y: [from.y, to.y], opacity: [0, 1, 1, 0] }
          : { opacity: 0 }
      }
      transition={
        isInView
          ? {
              duration: TRAVEL_DURATION,
              times: [0, 0.12, 0.88, 1],
              ease: 'linear',
              repeat: Infinity,
              repeatDelay: TRAVEL_GAP,
              delay,
            }
          : { duration: 0.3 }
      }
    >
      <circle r={halo} fill="url(#numi-spark-halo)" />
      <circle r={radius} fill="var(--color-neutro-claro)" />
    </motion.g>
  ))
}

/** Shared paint servers. Declared once; both layers reference them by id. */
function SparkDefs() {
  return (
    <defs>
      <linearGradient id="numi-beam" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--color-acento)" stopOpacity="0" />
        <stop offset="40%" stopColor="var(--color-acento)" stopOpacity="0.55" />
        <stop offset="65%" stopColor="var(--color-acento)" stopOpacity="0.55" />
        <stop offset="100%" stopColor="var(--color-acento)" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="numi-spark-halo">
        <stop offset="0%" stopColor="var(--color-acento)" stopOpacity="0.55" />
        <stop offset="100%" stopColor="var(--color-acento)" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

export function SparkBackdrop() {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  /*
   * The sparks loop for as long as the hero is on screen. Left ungated they
   * would keep compositing a new frame every 16ms for the whole visit while the
   * visitor reads a section ten screens further down — pure battery cost for
   * something nobody can see.
   */
  const isInView = useInView(ref, { amount: 0.05 })

  if (prefersReducedMotion) {
    return null
  }

  return (
    <div ref={ref} aria-hidden className="absolute inset-0">
      {/* Cropped exactly like the hero photograph, so these sparks sit on the
          diagonal that is already painted in it. */}
      <svg
        viewBox={`0 0 ${PHOTO_WIDTH} ${PHOTO_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <SparkDefs />
        <Sparks trails={photoTrails} isInView={isInView} />
      </svg>

      {/* The second line: drawn here, kept in the bottom band. */}
      <svg
        viewBox={`0 0 ${BEAM_WIDTH} ${BEAM_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] w-full"
      >
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
        <Sparks trails={beamTrails} isInView={isInView} />
      </svg>
    </div>
  )
}
