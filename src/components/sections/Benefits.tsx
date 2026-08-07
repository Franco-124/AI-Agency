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
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{t('title')}</caption>
            <thead>
              <tr className="bg-[var(--color-primario)]">
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
            <tbody>
              {benefitKeys.map((key) => (
                <tr
                  key={key}
                  className="border-b border-hairline transition-colors duration-200 last:border-b-0 hover:bg-[var(--color-primario)]"
                >
                  <th
                    scope="row"
                    className="w-[38%] px-5 py-6 align-top text-[0.9375rem] font-semibold sm:px-8 sm:text-base"
                  >
                    <span className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-acento)]"
                      />
                      {t(`items.${key}.benefit`)}
                    </span>
                  </th>
                  <td className="px-5 py-6 align-top text-[0.9375rem] leading-relaxed text-ink-muted sm:px-8">
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
