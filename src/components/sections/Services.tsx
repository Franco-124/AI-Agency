import {
  CalendarCheck,
  Database,
  Globe,
  MessageSquare,
  Repeat,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

const services: ReadonlyArray<{ key: string; Icon: LucideIcon }> = [
  { key: 'one', Icon: MessageSquare },
  { key: 'two', Icon: CalendarCheck },
  { key: 'three', Icon: Repeat },
  { key: 'four', Icon: Globe },
  { key: 'five', Icon: Database },
]

export function Services() {
  const t = useTranslations('services')

  return (
    <Section id={sectionIds.services} labelledBy="servicios-titulo" surface="raised">
      <Reveal>
        <SectionHeading id="servicios-titulo" title={t('title')} />
      </Reveal>

      {/*
        Five cards on a two-column grid: rows of 2-2-1, with the fifth spanning
        the full width so no empty cell is ever left over.
      */}
      <ul className="mt-14 grid gap-5 md:grid-cols-2">
        {services.map(({ key, Icon }, index) => (
          <Reveal
            as="li"
            key={key}
            delay={index * 0.06}
            className={cn(index === services.length - 1 && 'md:col-span-2')}
          >
            {/* Card visuals live one level down so the hover transition and the
                scroll entrance never compete for the same `transition` property. */}
            <div className="group relative flex h-full flex-col rounded-xl border border-hairline bg-[var(--color-neutro-oscuro)] p-7 transition-colors duration-200 hover:border-hairline-strong">
              <span
                aria-hidden
                className="accent-rule absolute inset-x-7 top-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />

              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-hairline bg-[var(--color-neutro-oscuro)] text-[var(--color-acento)]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>

              <h3 className="mt-7 text-lg font-semibold leading-snug tracking-[-0.02em]">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">
                {t(`items.${key}.body`)}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
