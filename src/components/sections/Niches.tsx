'use client'

import {
  Dumbbell,
  Home,
  PawPrint,
  Stethoscope,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { LazyMotionProvider } from '@/components/motion/LazyMotionProvider'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

/** Shared so all five cards are byte-identical in their resting state. */
const CARD_CLASSES =
  'group flex flex-col items-center gap-3 rounded-xl border border-hairline-strong bg-[var(--color-primario)] p-6 text-center transition-[border-color,transform] duration-150 ease-out hover:border-[var(--color-acento)] motion-safe:hover:-translate-y-1'
const ICON_CLASSES =
  'text-[var(--color-neutro-claro)] transition-colors duration-150 group-hover:text-[var(--color-acento)]'
const LABEL_CLASSES =
  'text-sm font-medium leading-snug text-[var(--color-neutro-claro)]'

const niches: ReadonlyArray<{ key: string; Icon: LucideIcon }> = [
  { key: 'one', Icon: Stethoscope },
  { key: 'two', Icon: Home },
  { key: 'three', Icon: PawPrint },
  { key: 'four', Icon: Wrench },
  { key: 'five', Icon: Dumbbell },
]

export function Niches() {
  const t = useTranslations('niches')
  const prefersReducedMotion = useReducedMotion()

  return (
    <Section id={sectionIds.niches} labelledBy="nichos-titulo" divided={false}>
      <Reveal>
        <SectionHeading id="nichos-titulo" title={t('title')} />
      </Reveal>

      <LazyMotionProvider>
        <ul className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {niches.map(({ key, Icon }, index) => (
          <m.li
            key={key}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-64px' }}
            transition={{
              duration: 0.4,
              delay: prefersReducedMotion ? 0 : index * 0.05,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className={CARD_CLASSES}
          >
            <Icon size={28} strokeWidth={1.5} aria-hidden="true" className={ICON_CLASSES} />
            <span className={LABEL_CLASSES}>{t(`items.${key}`)}</span>
            </m.li>
          ))}
        </ul>
      </LazyMotionProvider>

      <Reveal delay={0.16} className="mt-12">
        <div className="flex items-start gap-5">
          <span aria-hidden className="mt-4 h-px w-10 shrink-0 bg-[var(--color-acento)]" />
          <p className="max-w-2xl text-lg leading-relaxed text-ink sm:text-xl">
            {t('closing')}
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
