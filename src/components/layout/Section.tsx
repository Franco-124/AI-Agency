import Image from 'next/image'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Background treatments, alternated between consecutive sections so the scroll
 * reads as a sequence of distinct blocks instead of one continuous slab.
 *
 * - `base`    — the page background.
 * - `raised`  — one step lighter; cards inside must drop to the base colour.
 * - `texture` — the shared site texture plus grain, for atmospheric breaks.
 */
type Surface = 'base' | 'raised' | 'texture'

type SectionProps = {
  id: string
  children: ReactNode
  className?: string
  /** Adds the shared top hairline used to separate consecutive sections. */
  divided?: boolean
  /** Labelled by the section heading id, for landmark accessibility. */
  labelledBy?: string
  surface?: Surface
}

const surfaceClasses: Record<Surface, string> = {
  base: 'bg-[var(--color-neutro-oscuro)]',
  raised: 'bg-[var(--color-primario)]',
  texture: 'grain overflow-hidden bg-[var(--color-neutro-oscuro)]',
}

export function Section({
  id,
  children,
  className,
  divided = true,
  labelledBy,
  surface = 'base',
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative isolate scroll-mt-24 py-24 lg:py-32',
        surfaceClasses[surface],
        divided && 'border-t border-hairline',
        className,
      )}
    >
      {surface === 'texture' ? (
        <Image
          src="/images/10-textura-base-sitio.webp"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="-z-10 object-cover object-center opacity-90"
        />
      ) : null}

      <div className="mx-auto max-w-[80rem] px-5 sm:px-8">{children}</div>
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
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  className,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'type-eyebrow inline-flex items-center gap-2.5',
            align === 'center' && 'justify-center',
          )}
        >
          {/* Draws itself out of the heading as the block reveals. Centered
              headings grow from the middle so the rule stays on its axis. */}
          <span
            aria-hidden
            className={cn(
              'rule-draw h-px w-8 bg-[var(--color-acento)]',
              align === 'center' && 'origin-center',
            )}
          />
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className={cn('type-section-title', eyebrow && 'mt-6')}>
        {title}
      </h2>
      {lead ? <p className="type-lead mt-6">{lead}</p> : null}
    </div>
  )
}
