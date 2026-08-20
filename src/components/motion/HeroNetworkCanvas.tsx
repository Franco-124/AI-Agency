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
}

type Pulse = {
  from: number
  to: number
  progress: number
  speed: number
}

const NODE_COUNT = 16
const MAX_LINK_DISTANCE = 0.34
const MAX_PULSES = 5
const PULSE_SPAWN_CHANCE = 0.02

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

function withAlpha(hex: string, alpha: number) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return hex
  const int = Number.parseInt(match[1], 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
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
    const accent = readColor(wrapper, '--color-acento', '#ff5c1a')
    const lineColor = readColor(wrapper, '--color-secundario', '#2b3238')
    const nodeColor = readColor(wrapper, '--color-neutro-claro', '#f6f4f0')

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
      }))
      pulses = []
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

      if (pulses.length < MAX_PULSES && rng() < PULSE_SPAWN_CHANCE && links.length > 0) {
        const [from, to] = links[Math.floor(rng() * links.length)]
        pulses.push({ from, to, progress: 0, speed: 0.006 + rng() * 0.006 })
      }
      pulses = pulses.filter((pulse) => pulse.progress < 1)
      for (const pulse of pulses) pulse.progress += pulse.speed
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      ctx.lineWidth = 1
      for (const [i, j, distance] of links) {
        const a = nodes[i]
        const b = nodes[j]
        const fade = 1 - distance / MAX_LINK_DISTANCE
        ctx.strokeStyle = withAlpha(lineColor, fade * 0.5)
        ctx.beginPath()
        ctx.moveTo(a.x * width, a.y * height)
        ctx.lineTo(b.x * width, b.y * height)
        ctx.stroke()
      }

      for (const node of nodes) {
        ctx.beginPath()
        ctx.fillStyle = withAlpha(nodeColor, 0.55)
        ctx.arc(node.x * width, node.y * height, node.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const pulse of pulses) {
        const a = nodes[pulse.from]
        const b = nodes[pulse.to]
        const x = a.x + (b.x - a.x) * pulse.progress
        const y = a.y + (b.y - a.y) * pulse.progress
        const px = x * width
        const py = y * height
        const fade = pulse.progress < 0.5 ? pulse.progress * 2 : (1 - pulse.progress) * 2

        const glow = ctx.createRadialGradient(px, py, 0, px, py, 10)
        glow.addColorStop(0, withAlpha(accent, 0.85 * fade))
        glow.addColorStop(1, withAlpha(accent, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(px, py, 10, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = withAlpha(accent, fade)
        ctx.arc(px, py, 2.2, 0, Math.PI * 2)
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

    if (isInView) start()

    return () => {
      stop()
      resizeObserver.disconnect()
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
