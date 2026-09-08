'use client'

import { FileText, LifeBuoy, Rocket, Search, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { useScrollTrigger } from '@/components/motion/useScrollTrigger'
import { sectionIds } from '@/lib/site'

const steps: ReadonlyArray<{ key: string; Icon: LucideIcon }> = [
  { key: 'one', Icon: Search },
  { key: 'two', Icon: FileText },
  { key: 'three', Icon: Rocket },
  { key: 'four', Icon: LifeBuoy },
]

/** The whole line takes 1.2s; each node lights up as the line reaches it. */
const LINE_DURATION = 1.2
const SEGMENT_DURATION = LINE_DURATION / (steps.length - 1)

/**
 * One custom property per element drives both its delay and, for connectors,
 * its own duration — so the line reaches every node exactly when that node
 * lights up regardless of the grid gutter. See `[data-rail]` in `globals.css`.
 */
const railVars = (index: number) =>
  ({
    '--rail-delay': `${index * SEGMENT_DURATION}s`,
    '--rail-segment': `${SEGMENT_DURATION}s`,
  }) as CSSProperties

/**
 * Rests lit; `[data-rail='pending']` is what dims it back to the resting grey.
 *
 * The ring is keyed to the section's own surface (`sunken`), not to the page
 * background — it exists to punch a gap between the node and the connector
 * line running under it, and a ring in the wrong colour draws a visible halo
 * instead. It is also given the accent glow, so a lit node reads as a light
 * source rather than as a coloured dot.
 */
const NODE_CLASSES = [
  'rail-node block h-[0.6875rem] w-[0.6875rem] rounded-full',
  'bg-[var(--color-acento)] ring-4 ring-[var(--surface-sunken)]',
  'shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-acento-lift)_45%,transparent),0_0_12px_color-mix(in_srgb,var(--color-acento)_55%,transparent)]',
].join(' ')

export function Process() {
  const t = useTranslations('process')

  /*
    `playOnLoad` because this is an in-place effect rather than an entrance: if
    the timeline is already on screen it should draw itself straight away rather
    than wait for a scroll that may never come.
  */
  const { ref, state } = useScrollTrigger<HTMLDivElement>({
    rootMargin: '0px 0px -100px 0px',
    playOnLoad: true,
  })

  return (
    // Sunken: the timeline reads as a recess between the lit blocks either
    // side of it, which is what gives the scroll a front-to-back rhythm and
    // not only a light/dark one.
    <Section
      id={sectionIds.process}
      labelledBy="proceso-titulo"
      surface="sunken"
      rhythm="wide"
    >
      <Reveal>
        <SectionHeading id="proceso-titulo" index={2} title={t('title')} />
      </Reveal>

      {/*
        The timeline is drawn in markup rather than shipped as an image, so it
        stays sharp, follows the design tokens and animates from CSS alone — no
        animation runtime is loaded for this section.
      */}
      <div ref={ref} data-rail={state} className="mt-16">
        {/* Horizontal rail — desktop. One connector segment per gap. */}
        <ul aria-hidden className="mb-8 hidden grid-cols-4 gap-x-8 lg:grid">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1

            return (
              <li key={step.key} className="flex items-center">
                <span style={railVars(index)} className={`${NODE_CLASSES} shrink-0`} />

                {!isLast ? (
                  <span className="relative -mr-8 h-px flex-1">
                    <span className="absolute inset-0 bg-[var(--surface-border)]" />
                    <span
                      style={railVars(index)}
                      className="rail-fill absolute inset-0 bg-[var(--color-acento)]"
                    />
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>

        <ol className="grid gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:grid-cols-4 lg:gap-x-8">
          {steps.map(({ key, Icon }, index) => {
            const isLast = index === steps.length - 1

            return (
              <li
                key={key}
                style={railVars(index)}
                className="rail-step relative flex gap-5 lg:block lg:gap-0"
              >
                {/* Vertical rail — mobile and tablet. */}
                <div className="relative flex shrink-0 flex-col items-center lg:hidden">
                  <span aria-hidden className={`${NODE_CLASSES} mt-1.5`} />
                  {!isLast ? (
                    <span
                      aria-hidden
                      className="mt-1 w-px flex-1 bg-[var(--surface-border)] sm:hidden"
                    />
                  ) : null}
                </div>

                <div className="min-w-0">
                  {/*
                    The ordinal leads, set in the display face at figure scale:
                    a consulting engagement is a sequence, so the step number is
                    the primary wayfinding cue. It used to be 12px letter-spaced
                    metadata below the icon, which read as a label rather than a
                    position and left the four steps visually interchangeable.
                    The icon drops to a quiet accent beside it.
                  */}
                  {/*
                    The ordinal is now a hollow outline rather than a solid
                    accent fill. Four solid 32px violet numerals down a row
                    pulled more weight than the step titles they label — the
                    outline keeps the editorial scale while returning the
                    emphasis to the copy, and it is the same device the
                    Benefits list uses, so the two blocks read as one system.
                  */}
                  <div className="flex items-baseline gap-3">
                    <span
                      aria-hidden
                      className="type-figure text-[1.75rem] leading-none tabular-nums text-transparent sm:text-[2rem] [-webkit-text-stroke:1px_var(--accent-hairline)]"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden
                      className="h-px w-5 shrink-0 bg-[var(--surface-border)]"
                    />
                    <Icon
                      size={17}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--accent-text)]"
                    />
                  </div>
                  <h3 className="mt-4 text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] sm:text-lg">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="type-body mt-2.5 max-w-[32ch]">
                    {t(`steps.${key}.body`)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
