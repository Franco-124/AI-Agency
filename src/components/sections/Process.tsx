'use client'

import { FileText, LifeBuoy, Rocket, Search, type LucideIcon } from 'lucide-react'
import { m, useInView, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'

import { Section, SectionHeading } from '@/components/layout/Section'
import { LazyMotionProvider } from '@/components/motion/LazyMotionProvider'
import { Reveal } from '@/components/motion/Reveal'
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
const nodeDelay = (index: number) => index * SEGMENT_DURATION

export function Process() {
  const t = useTranslations('process')
  const prefersReducedMotion = useReducedMotion()
  const railRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(railRef, { once: true, margin: '-100px' })

  const isActive = prefersReducedMotion || isInView

  const nodeClasses =
    'block h-3 w-3 rounded-full ring-4 ring-[var(--color-neutro-oscuro)]'

  return (
    <Section id={sectionIds.process} labelledBy="proceso-titulo">
      <Reveal>
        <SectionHeading id="proceso-titulo" title={t('title')} />
      </Reveal>

      {/*
        The timeline is drawn in CSS/SVG-free markup rather than shipped as an
        image, so it stays sharp, follows the design tokens and can animate.
      */}
      <LazyMotionProvider>
      <div ref={railRef} className="mt-16">
        {/*
          Horizontal rail — desktop. One connector segment per gap, each drawn
          with its own delay, so the line reaches every node exactly when that
          node lights up regardless of the grid gutter.
        */}
        <ul
          aria-hidden
          className="mb-8 hidden grid-cols-4 gap-x-8 lg:grid"
        >
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1

            return (
              <li key={step.key} className="flex items-center">
                <m.span
                  initial={
                    prefersReducedMotion
                      ? false
                      : { backgroundColor: 'var(--color-secundario)' }
                  }
                  animate={
                    isActive
                      ? { backgroundColor: 'var(--color-acento)' }
                      : undefined
                  }
                  transition={{
                    duration: 0.3,
                    delay: prefersReducedMotion ? 0 : nodeDelay(index),
                  }}
                  className={`${nodeClasses} shrink-0 bg-[var(--color-secundario)]`}
                />

                {!isLast ? (
                  <span className="relative -mr-8 h-px flex-1">
                    <span className="absolute inset-0 bg-[var(--surface-border)]" />
                    <m.span
                      initial={prefersReducedMotion ? false : { scaleX: 0 }}
                      animate={isActive ? { scaleX: 1 } : undefined}
                      transition={{
                        duration: SEGMENT_DURATION,
                        delay: prefersReducedMotion ? 0 : nodeDelay(index),
                        ease: 'easeOut',
                      }}
                      style={{ transformOrigin: 'left' }}
                      className="absolute inset-0 bg-[var(--color-acento)]"
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
              <m.li
                key={key}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={isActive ? { opacity: 1, y: 0 } : undefined}
                transition={{
                  duration: 0.4,
                  delay: prefersReducedMotion ? 0 : nodeDelay(index),
                  ease: [0.22, 0.61, 0.36, 1],
                }}
                className="relative flex gap-5 lg:block lg:gap-0"
              >
                {/* Vertical rail — mobile and tablet. */}
                <div className="relative flex shrink-0 flex-col items-center lg:hidden">
                  <m.span
                    aria-hidden
                    initial={
                      prefersReducedMotion
                        ? false
                        : { backgroundColor: 'var(--color-secundario)' }
                    }
                    animate={
                      isActive
                        ? { backgroundColor: 'var(--color-acento)' }
                        : undefined
                    }
                    transition={{
                      duration: 0.3,
                      delay: prefersReducedMotion ? 0 : nodeDelay(index),
                    }}
                    className={`${nodeClasses} mt-1.5 bg-[var(--color-secundario)]`}
                  />
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
              </m.li>
            )
          })}
        </ol>
      </div>
      </LazyMotionProvider>
    </Section>
  )
}
