import Image from 'next/image'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Background treatments, alternated between consecutive sections so the scroll
 * reads as a sequence of distinct blocks instead of one continuous slab.
 *
 * - `base`    — the page background.
 * - `sunken`  — one step *darker*. Used for the blocks that should read as a
 *               recess between two lit ones; the ladder previously only went
 *               up, so alternating meant every other section was lighter and
 *               the page drifted brighter as it scrolled.
 * - `raised`  — one step lighter; cards inside must drop to the base colour.
 * - `texture` — the shared site texture plus grain, for atmospheric breaks.
 */
type Surface = 'base' | 'sunken' | 'raised' | 'texture'

/**
 * Vertical rhythm. The whole page previously ran at one padding value, which
 * is the single largest reason a long landing reads as generated: eleven
 * blocks of identical height give the eye no sense of grouping or arrival.
 *
 * - `tight`  — this block belongs to the one above it (Advisory under
 *              Packages, Integrations under Advisory).
 * - `normal` — an ordinary section.
 * - `wide`   — an arrival. Reserved for the blocks that carry a turn in the
 *              argument, where the extra air is what signals "new subject".
 */
type Rhythm = 'tight' | 'normal' | 'wide'

type SectionProps = {
  id: string
  children: ReactNode
  className?: string
  /** Adds the shared top rule used to separate consecutive sections. */
  divided?: boolean
  /** Labelled by the section heading id, for landmark accessibility. */
  labelledBy?: string
  surface?: Surface
  rhythm?: Rhythm
  /** Overrides the shared texture image when `surface="texture"`. */
  backgroundSrc?: string
}

const surfaceClasses: Record<Surface, string> = {
  base: 'bg-[var(--surface-base)]',
  sunken: 'bg-[var(--surface-sunken)]',
  raised: 'bg-[var(--surface-raised)]',
  texture: 'grain overflow-hidden bg-[var(--surface-base)]',
}

const rhythmClasses: Record<Rhythm, string> = {
  tight: 'py-[var(--space-section-tight)]',
  normal: 'py-[var(--space-section)]',
  wide: 'py-[var(--space-section-wide)]',
}

export function Section({
  id,
  children,
  className,
  divided = true,
  labelledBy,
  surface = 'base',
  rhythm = 'normal',
  backgroundSrc = '/images/10-textura-base-sitio.webp',
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative isolate scroll-mt-24',
        surfaceClasses[surface],
        rhythmClasses[rhythm],
        className,
      )}
    >
      {/*
        The separator is a positioned element rather than `border-top`, so it
        can fade out at both ends. A full-bleed 1px line repeated down eleven
        sections is the most visible "template" artefact on a long page; one
        that resolves into the background reads as a deliberate break.
      */}
      {divided ? (
        <span
          aria-hidden
          className="edge-rule pointer-events-none absolute inset-x-0 top-0"
        />
      ) : null}

      {surface === 'texture' ? (
        <Image
          src={backgroundSrc}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="-z-10 object-cover object-center opacity-90"
        />
      ) : null}

      <div className="mx-auto w-full max-w-[var(--measure-page)] px-5 sm:px-8">
        {children}
      </div>
    </section>
  )
}

type SectionHeadingProps = {
  id?: string
  eyebrow?: string
  title: string
  lead?: string
  className?: string
  align?: 'left' | 'center'
  /**
   * Two-digit index shown before the eyebrow. Decorative and `aria-hidden`:
   * it exists so the visitor can place a block within the sequence, which
   * eleven identically-headed sections gave them no way to do.
   */
  index?: number
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  className,
  align = 'left',
  index,
}: SectionHeadingProps) {
  const hasMeta = Boolean(eyebrow) || index !== undefined

  return (
    <div
      className={cn(
        'max-w-[46rem]',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {hasMeta ? (
        <div
          className={cn(
            'flex items-center gap-3',
            align === 'center' && 'justify-center',
          )}
        >
          {index !== undefined ? (
            <span aria-hidden className="section-index">
              {String(index).padStart(2, '0')}
            </span>
          ) : null}

          {/* Draws itself out of the heading as the block reveals. Centered
              headings grow from the middle so the rule stays on its axis. */}
          <span
            aria-hidden
            className={cn(
              'rule-draw h-px w-7 shrink-0 bg-[var(--accent-hairline)]',
              align === 'center' && 'origin-center',
            )}
          />

          {eyebrow ? <p className="type-eyebrow">{eyebrow}</p> : null}
        </div>
      ) : null}

      <h2 id={id} className={cn('type-section-title', hasMeta && 'mt-5')}>
        {title}
      </h2>

      {lead ? (
        <p className={cn('type-lead mt-5', align === 'center' && 'mx-auto')}>
          {lead}
        </p>
      ) : null}
    </div>
  )
}
