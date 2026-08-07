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

/** Rests lit; `[data-rail='pending']` is what dims it back to the resting grey. */
const NODE_CLASSES =
  'rail-node block h-3 w-3 rounded-full bg-[var(--color-acento)] ring-4 ring-[var(--color-neutro-oscuro)]'

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
    <Section id={sectionIds.process} labelledBy="proceso-titulo">
      <Reveal>
        <SectionHeading id="proceso-titulo" title={t('title')} />
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
                  <Icon
                    size={24}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="text-ink-muted"
                  />
                  <span className="mt-5 block text-xs tabular-nums tracking-[0.14em] text-ink-faint">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em]">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="mt-3 max-w-xs text-[0.9375rem] leading-relaxed text-ink-muted">
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
