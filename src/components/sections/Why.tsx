import { Handshake, Puzzle, TrendingUp, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

const pillars: ReadonlyArray<{ key: string; Icon: LucideIcon }> = [
  { key: 'one', Icon: TrendingUp },
  { key: 'two', Icon: Puzzle },
  { key: 'three', Icon: Handshake },
]

export function Why() {
  const t = useTranslations('why')

  return (
    <Section id={sectionIds.why} labelledBy="por-que-titulo">
      <Reveal>
        <SectionHeading id="por-que-titulo" title={t('title')} />
      </Reveal>

      {/* Same icon-in-a-box card language as "Cómo trabajamos con tu negocio". */}
      <ul className="mt-14 grid gap-5 md:grid-cols-3">
        {pillars.map(({ key, Icon }, index) => (
          <Reveal as="li" key={key} delay={index * 0.06}>
            <div className="group relative flex h-full flex-col rounded-xl border border-hairline bg-[var(--color-primario)] p-7 transition-colors duration-200 hover:border-hairline-strong">
              <span
                aria-hidden
                className="accent-rule absolute inset-x-7 top-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />

              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-hairline bg-[var(--color-neutro-oscuro)] text-[var(--color-acento)]">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>

              <h3 className="mt-7 text-lg font-semibold leading-snug tracking-[-0.02em]">
                {t(`pillars.${key}.title`)}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">
                {t(`pillars.${key}.body`)}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
