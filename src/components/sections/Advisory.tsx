import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { priceClasses, priceScale } from '@/lib/price-display'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

import { AdvisoryCtaLink } from './AdvisoryCtaLink'

const diagnosticFeatureKeys = ['one', 'two', 'three'] as const
const trainingFeatureKeys = ['one', 'two', 'three', 'four', 'five'] as const

type AdvisoryCardProps = {
  /** Translation prefix — also the interest key recorded by the CTA. */
  offer: 'diagnostic' | 'training'
  featureKeys: readonly string[]
  t: ReturnType<typeof useTranslations>
  variant: 'primary' | 'outline'
  /** The diagnostic tier's fine print. Absent on the training tier. */
  note?: ReactNode
}

/**
 * One advisory offer.
 *
 * Extracted because the two tiers were a verbatim duplicate of this markup —
 * every spacing, a11y or surface change had to be made twice and the copies
 * had already begun to drift (the training card was missing the note slot's
 * spacing compensation).
 */
function AdvisoryCard({ offer, featureKeys, t, variant, note }: AdvisoryCardProps) {
  const price = t(`${offer}.price`)

  return (
    <div className="surface-panel lift flex flex-col rounded-[1.125rem] p-6 sm:p-8">
      <h3 className="font-display text-[1.1875rem] font-medium leading-snug tracking-[-0.025em] sm:text-xl">
        {t(`${offer}.name`)}
      </h3>
      <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-faint">
        {t(`${offer}.subtitle`)}
      </p>

      {/* Hairline between the pitch and the deliverables, matching the
          packages panel — the two offer blocks share one card grammar. */}
      <ul className="mt-6 flex flex-col gap-3.5 border-t border-hairline-subtle pt-6">
        {featureKeys.map((featureKey) => (
          <li key={featureKey} className="flex gap-2.5">
            <span
              aria-hidden
              className="mt-[0.1875rem] flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-[0.3125rem] border border-hairline bg-[var(--surface-inset)]"
            >
              <Check className="h-[0.6875rem] w-[0.6875rem] text-ink-muted" strokeWidth={2.5} />
            </span>
            <span className="type-body text-[0.9375rem]">
              {t(`${offer}.features.${featureKey}`)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-hairline-subtle pt-7">
        {/* Both advisory prices carry terms after the figure ("· 1–2 sesiones",
            "· Programa de 4 sesiones"), so which of them still scans as a
            figure depends on the string — the shared `priceScale` decides,
            the same way it does for the packages above. */}
        <p
          className={cn(
            'text-[var(--accent-text)]',
            priceClasses[priceScale(price)],
          )}
        >
          {price}
        </p>
        {note}

        <AdvisoryCtaLink interestKey={offer} variant={variant}>
          {t(`${offer}.cta`)}
        </AdvisoryCtaLink>
      </div>
    </div>
  )
}

/**
 * Independent from the three packages, so it deliberately does not reuse
 * `Packages`' three-column comparison panel — a two-card grid keeps it from
 * reading as a fourth tier of the same ladder.
 */
export function Advisory() {
  const t = useTranslations('advisory')

  return (
    // `tight` rhythm on purpose: this is the lighter alternative to the
    // packages directly above, so the two blocks should read as one offer
    // spread rather than as two unrelated sections.
    <Section
      id={sectionIds.advisory}
      labelledBy="asesoria-titulo"
      surface="raised"
      rhythm="tight"
    >
      <Reveal>
        <SectionHeading
          id="asesoria-titulo"
          index={7}
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />
      </Reveal>

      <Reveal delay={0.1} className="mt-12 sm:mt-14">
        <div className="grid gap-5 lg:grid-cols-2">
          <AdvisoryCard
            offer="diagnostic"
            featureKeys={diagnosticFeatureKeys}
            t={t}
            variant="outline"
            note={
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-faint">
                {t('diagnostic.note')}
              </p>
            }
          />
          <AdvisoryCard
            offer="training"
            featureKeys={trainingFeatureKeys}
            t={t}
            variant="primary"
          />
        </div>
      </Reveal>

      {/*
        The closing differentiation note. Centred and narrow, set off by a
        hairline above it — the one place on the page where a centred measure
        is right, because it is an aside to the whole block rather than a
        column of its own.
      */}
      <Reveal delay={0.18} className="mt-12 sm:mt-14">
        <div className="mx-auto flex max-w-[38rem] flex-col items-center gap-3 border-t border-hairline-subtle pt-12 text-center sm:pt-14">
          <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] sm:text-lg">
            {t('differentiation.title')}
          </h3>
          <p className="type-body">{t('differentiation.body')}</p>
        </div>
      </Reveal>
    </Section>
  )
}
