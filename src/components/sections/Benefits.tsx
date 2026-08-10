import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

const benefitKeys = ['one', 'two', 'three', 'four'] as const

export function Benefits() {
  const t = useTranslations('benefits')

  return (
    <Section id={sectionIds.benefits} labelledBy="beneficios-titulo">
      <Reveal>
        <SectionHeading id="beneficios-titulo" title={t('title')} />
      </Reveal>

      <Reveal delay={0.08} className="mt-14">
        <div className="overflow-hidden rounded-xl border border-hairline">
          {/* Below `sm` the table collapses into stacked label/value blocks —
              at a 38%-width first column a real benefit label like "Mejor
              atención al cliente" was wrapping across 3+ lines in a ~120px
              cell on a 360px phone. The table semantics (scope, caption)
              stay for assistive tech; only the visual display role changes. */}
          <table className="block w-full border-collapse text-left sm:table">
            <caption className="sr-only">{t('title')}</caption>
            <thead className="hidden sm:table-header-group">
              <tr className="bg-[var(--color-primario)] sm:table-row">
                <th
                  scope="col"
                  className="type-eyebrow border-b border-hairline px-5 py-4 sm:px-8"
                >
                  {t('columnBenefit')}
                </th>
                <th
                  scope="col"
                  className="type-eyebrow border-b border-hairline px-5 py-4 sm:px-8"
                >
                  {t('columnMeaning')}
                </th>
              </tr>
            </thead>
            <tbody className="block sm:table-row-group">
              {benefitKeys.map((key) => (
                <tr
                  key={key}
                  className="block border-b border-hairline transition-colors duration-200 last:border-b-0 hover:bg-[var(--color-primario)] sm:table-row"
                >
                  <th
                    scope="row"
                    className="block px-5 pb-2 pt-6 align-top text-[0.9375rem] font-semibold sm:table-cell sm:w-[38%] sm:px-8 sm:py-6 sm:text-base"
                  >
                    <span className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-acento)]"
                      />
                      {t(`items.${key}.benefit`)}
                    </span>
                  </th>
                  <td className="block px-5 pb-6 align-top text-[0.9375rem] leading-relaxed text-ink-muted sm:table-cell sm:px-8 sm:py-6">
                    {t(`items.${key}.meaning`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </Section>
  )
}
