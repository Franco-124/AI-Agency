import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

import { AdvisoryCtaLink } from './AdvisoryCtaLink'

const diagnosticFeatureKeys = ['one', 'two', 'three'] as const
const trainingFeatureKeys = ['one', 'two', 'three', 'four', 'five'] as const

/**
 * Independent from the three packages, so it deliberately does not reuse
 * `Packages`' three-column comparison panel — a two-card grid keeps it from
 * reading as a fourth tier of the same ladder.
 */
export function Advisory() {
  const t = useTranslations('advisory')

  return (
    <Section id={sectionIds.advisory} labelledBy="asesoria-titulo" surface="raised">
      <Reveal>
        <SectionHeading
          id="asesoria-titulo"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />
      </Reveal>

      <Reveal delay={0.1} className="mt-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_88%,transparent)] p-7 sm:p-9">
            <h3 className="text-xl font-semibold leading-snug tracking-[-0.025em]">
              {t('diagnostic.name')}
            </h3>
            <p className="mt-3 text-sm text-ink-faint">{t('diagnostic.subtitle')}</p>

            <ul className="mt-8 flex flex-col gap-4">
              {diagnosticFeatureKeys.map((featureKey) => (
                <li key={featureKey} className="flex gap-3">
                  <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                  <span className="text-[0.9375rem] leading-relaxed text-ink-muted">
                    {t(`diagnostic.features.${featureKey}`)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-10">
              <p className="type-figure text-2xl text-[var(--color-acento)] sm:text-[1.75rem]">
                {t('diagnostic.price')}
              </p>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-faint">
                {t('diagnostic.note')}
              </p>

              <AdvisoryCtaLink interestKey="diagnostic" variant="outline">
                {t('diagnostic.cta')}
              </AdvisoryCtaLink>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_88%,transparent)] p-7 sm:p-9">
            <h3 className="text-xl font-semibold leading-snug tracking-[-0.025em]">
              {t('training.name')}
            </h3>
            <p className="mt-3 text-sm text-ink-faint">{t('training.subtitle')}</p>

            <ul className="mt-8 flex flex-col gap-4">
              {trainingFeatureKeys.map((featureKey) => (
                <li key={featureKey} className="flex gap-3">
                  <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                  <span className="text-[0.9375rem] leading-relaxed text-ink-muted">
                    {t(`training.features.${featureKey}`)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-10">
              <p className="type-figure text-2xl text-[var(--color-acento)] sm:text-[1.75rem]">
                {t('training.price')}
              </p>

              <AdvisoryCtaLink interestKey="training" variant="primary">
                {t('training.cta')}
              </AdvisoryCtaLink>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.18} className="mt-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h3 className="text-lg font-semibold leading-snug tracking-[-0.02em]">
            {t('differentiation.title')}
          </h3>
          <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
            {t('differentiation.body')}
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
