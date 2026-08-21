'use client'

import { useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

/**
 * Advanced hero backdrop: a canvas network of nodes with light pulses
 * travelling along their connections — a literal read of the hero's claim
 * (a message reaching an answer instantly) instead of decorative noise.
 *
 * Canvas over CSS/SVG here because the pulse-along-a-path motion needs
 * per-frame position math; everything else in the hero stays CSS-driven.
 * No video asset, no WebGL — a 2D canvas keeps this dependency-free and
 * cheap enough to run behind the LCP image without affecting it (this
 * layer is code-split and mounted client-side only, see HeroMotion).
 */

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  /** Per-node parallax weight — nearer "layer" nodes drift more under pointer. */
  depth: number
}

type Pulse = {
  from: number
  to: number
  progress: number
  speed: number
}

const NODE_COUNT = 24
const MAX_LINK_DISTANCE = 0.3
const MAX_PULSES = 7
const PULSE_SPAWN_CHANCE = 0.025
/** Fraction of the wrapper size the field can shift toward the pointer. */
const PARALLAX_STRENGTH = 0.02
/** How quickly the parallax offset eases toward its target each frame. */
const PARALLAX_EASE = 0.06

/*
 * A tiny deterministic PRNG (mulberry32) instead of Math.random: the layout
 * is identical on every load, matching the art-directed, reproducible field
 * used by the sibling particle layer, while still reading as organic.
 */
function createRng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function readColor(el: HTMLElement, token: string, fallback: string) {
  const value = getComputedStyle(el).getPropertyValue(token).trim()
  return value || fallback
}

/** Parses a `#rrggbb` hex string once, up front — never per frame. */
function hexToRgb(hex: string): readonly [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return [255, 255, 255]
  const int = Number.parseInt(match[1], 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function rgba([r, g, b]: readonly [number, number, number], alpha: number) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Pre-renders a pulse's radial glow (outer haze + inner core) onto an
 * offscreen canvas once, so `draw()` only ever calls `drawImage` per pulse
 * instead of building two `CanvasGradient`s per pulse, per frame — the
 * costliest operation in this component at up to `MAX_PULSES` concurrent.
 */
function createGlowSprite(accentRgb: readonly [number, number, number]) {
  const size = 44
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const sctx = sprite.getContext('2d')
  if (!sctx) return sprite

  const center = size / 2
  const outer = sctx.createRadialGradient(center, center, 0, center, center, 22)
  outer.addColorStop(0, rgba(accentRgb, 0.32))
  outer.addColorStop(1, rgba(accentRgb, 0))
  sctx.fillStyle = outer
  sctx.beginPath()
  sctx.arc(center, center, 22, 0, Math.PI * 2)
  sctx.fill()

  const inner = sctx.createRadialGradient(center, center, 0, center, center, 11)
  inner.addColorStop(0, rgba(accentRgb, 0.9))
  inner.addColorStop(1, rgba(accentRgb, 0))
  sctx.fillStyle = inner
  sctx.beginPath()
  sctx.arc(center, center, 11, 0, Math.PI * 2)
  sctx.fill()

  return sprite
}

export function HeroNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const isInView = useInView(wrapperRef, { amount: 0.05 })

  useEffect(() => {
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rng = createRng(1337)
    const accentRgb = hexToRgb(readColor(wrapper, '--color-acento', '#9333ea'))
    const lineRgb = hexToRgb(readColor(wrapper, '--color-secundario', '#322b3d'))
    const nodeRgb = hexToRgb(readColor(wrapper, '--color-neutro-claro', '#f5f3f8'))
    const glowSprite = createGlowSprite(accentRgb)
    const glowSize = glowSprite.width

    let width = 0
    let height = 0
    let dpr = 1
    let nodes: Node[] = []
    let pulses: Pulse[] = []
    let frameId = 0
    let running = false

    const seedNodes = () => {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: rng(),
        y: rng(),
        vx: (rng() - 0.5) * 0.00014,
        vy: (rng() - 0.5) * 0.00014,
        radius: 1.6 + rng() * 1.8,
        depth: 0.4 + rng() * 0.6,
      }))
      pulses = []
    }

    // Pointer parallax: target set on move, eased toward every frame so the
    // field settles smoothly instead of snapping to the cursor.
    let pointerTargetX = 0
    let pointerTargetY = 0
    let parallaxX = 0
    let parallaxY = 0

    // Listens on the window rather than the wrapper: the wrapper's ancestor
    // carries `pointer-events-none` (the layer must never intercept clicks
    // meant for the headline/CTA), so a listener on it would never fire.
    // Coordinates are clamped to [-1, 1] so pointer positions outside the
    // hero box still settle the field instead of pinning it at an edge.
    const handlePointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const rawX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      const rawY = ((event.clientY - rect.top) / rect.height - 0.5) * 2
      pointerTargetX = Math.max(-1, Math.min(1, rawX))
      pointerTargetY = Math.max(-1, Math.min(1, rawY))
    }

    const handlePointerLeaveWindow = () => {
      pointerTargetX = 0
      pointerTargetY = 0
    }

    const resize = () => {
      const rect = wrapper.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const links: Array<[number, number, number]> = []
    const buildLinks = () => {
      links.length = 0
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.hypot(dx, dy)
          if (distance < MAX_LINK_DISTANCE) {
            links.push([i, j, distance])
          }
        }
      }
    }

    const step = () => {
      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy
        if (node.x < 0.02 || node.x > 0.98) node.vx *= -1
        if (node.y < 0.02 || node.y > 0.98) node.vy *= -1
      }
      buildLinks()

      parallaxX += (pointerTargetX - parallaxX) * PARALLAX_EASE
      parallaxY += (pointerTargetY - parallaxY) * PARALLAX_EASE

      if (pulses.length < MAX_PULSES && rng() < PULSE_SPAWN_CHANCE && links.length > 0) {
        const [from, to] = links[Math.floor(rng() * links.length)]
        pulses.push({ from, to, progress: 0, speed: 0.006 + rng() * 0.006 })
      }
      pulses = pulses.filter((pulse) => pulse.progress < 1)
      for (const pulse of pulses) pulse.progress += pulse.speed
    }

    // Projects a node's normalised position to canvas pixels, offset by the
    // eased pointer parallax scaled to that node's depth — nodes with more
    // depth (closer "layer") drift further, giving the field real dimension
    // instead of moving as one flat plane.
    const project = (node: Node) => {
      const offsetX = parallaxX * PARALLAX_STRENGTH * node.depth * width
      const offsetY = parallaxY * PARALLAX_STRENGTH * node.depth * height
      return [node.x * width + offsetX, node.y * height + offsetY] as const
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      ctx.lineWidth = 1
      for (const [i, j, distance] of links) {
        const [ax, ay] = project(nodes[i])
        const [bx, by] = project(nodes[j])
        const fade = 1 - distance / MAX_LINK_DISTANCE
        ctx.strokeStyle = rgba(lineRgb, fade * 0.5)
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }

      ctx.fillStyle = rgba(nodeRgb, 0.55)
      for (const node of nodes) {
        const [nx, ny] = project(node)
        ctx.beginPath()
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const pulse of pulses) {
        const a = nodes[pulse.from]
        const b = nodes[pulse.to]
        const [ax, ay] = project(a)
        const [bx, by] = project(b)
        const px = ax + (bx - ax) * pulse.progress
        const py = ay + (by - ay) * pulse.progress
        const fade = pulse.progress < 0.5 ? pulse.progress * 2 : (1 - pulse.progress) * 2

        // Pre-rendered sprite stamped via drawImage — no CanvasGradient is
        // built here, so this stays cheap even with several pulses at once.
        ctx.globalAlpha = fade
        ctx.drawImage(glowSprite, px - glowSize / 2, py - glowSize / 2)
        ctx.globalAlpha = 1

        ctx.beginPath()
        ctx.fillStyle = rgba(nodeRgb, fade)
        ctx.arc(px, py, 2.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      if (!running) return
      step()
      draw()
      frameId = window.requestAnimationFrame(loop)
    }

    const start = () => {
      if (running) return
      running = true
      frameId = window.requestAnimationFrame(loop)
    }

    const stop = () => {
      running = false
      window.cancelAnimationFrame(frameId)
    }

    seedNodes()
    resize()
    draw()

    const resizeObserver = new ResizeObserver(() => {
      resize()
      draw()
    })
    resizeObserver.observe(wrapper)

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeaveWindow)

    if (isInView) start()

    return () => {
      stop()
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeaveWindow)
    }
  }, [prefersReducedMotion, isInView])

  if (prefersReducedMotion) {
    return null
  }

  return (
    <div ref={wrapperRef} aria-hidden className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
