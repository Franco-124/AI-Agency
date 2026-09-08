import { ArrowRight, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { CalculadoraAhorro } from '@/components/sections/CalculadoraAhorro'
import { PackageCtaLink } from '@/components/sections/PackageCtaLink'
import { Button } from '@/components/ui/button'
import type { PackageKey } from '@/lib/package-interest'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

type PackageDefinition = {
  key: PackageKey | 'website'
  featureKeys: readonly string[]
  featured: boolean
}

export const packages: readonly PackageDefinition[] = [
  { key: 'website', featureKeys: ['one', 'two', 'three', 'four'], featured: false },
  { key: 'one', featureKeys: ['one', 'two', 'three'], featured: false },
  { key: 'two', featureKeys: ['one', 'two', 'three', 'four'], featured: true },
  { key: 'three', featureKeys: ['one', 'two', 'three', 'four'], featured: false },
]

/**
 * The standalone website offer leads, followed by the three AI systems. The
 * cards deliberately retain their shared visual language while the explanatory
 * copy explains how each system differs.
 */
export function Packages() {
  const t = useTranslations('packages')

  return (
    <Section id={sectionIds.packages} labelledBy="paquetes-titulo" surface="texture">
      <Reveal>
        <SectionHeading
          id="paquetes-titulo"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />
      </Reveal>

      <Reveal delay={0.1} className="mt-14">
        <div className="overflow-hidden rounded-2xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_88%,transparent)]">
          <ul className="divide-y divide-hairline">
            {packages.slice(0, 1).map(({ key, featureKeys, featured }) => (
              <li key={key} className="flex flex-col p-7 sm:p-9">
                <p
                  className={cn(
                    'type-eyebrow h-4',
                    featured ? 'text-[var(--color-acento)]' : 'opacity-0',
                  )}
                >
                  {featured ? t('badge') : '—'}
                </p>

                <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.025em]">
                  {t(`${key}.name`)}
                </h3>
                <p className="mt-3 text-sm text-ink-faint">{t(`${key}.audience`)}</p>

                <ul className="mt-8 flex flex-col gap-4">
                  {featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex gap-3">
                      <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                      <span className="text-[0.9375rem] leading-relaxed text-ink-muted">
                        {t(`${key}.features.${featureKey}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {key === 'website' ? (
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-faint">
                    {t('website.note')}
                  </p>
                ) : null}

                <div className="mt-auto pt-10">
                  <p className="type-figure text-2xl text-[var(--color-acento)] sm:text-[1.75rem]">
                    {t(`${key}.price`)}
                  </p>
                  <p className="mt-2 text-sm text-ink-faint">{t(`${key}.maintenance`)}</p>

                  <Button asChild block size="lg" variant="outline" className="mt-8">
                    <a href={`#${sectionIds.finalCta}`}>{t(`${key}.cta`)}</a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 max-w-3xl">
          <h3 className="text-xl font-semibold leading-snug tracking-[-0.025em]">
            {t('systems.title')}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-faint">{t('systems.lead')}</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-ink-muted">
            {['one', 'two', 'three', 'four'].map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="text-[var(--color-acento)]">—</span>
                <span>{t(`systems.items.${item}`)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-ink-faint">{t('systems.note')}</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_88%,transparent)]">
          <ul className="grid divide-y divide-hairline lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {packages.slice(1).map(({ key, featureKeys, featured }) => (
              <li key={key} className="flex flex-col p-7 sm:p-9">
                <p
                  className={cn(
                    'type-eyebrow h-4',
                    featured ? 'text-[var(--color-acento)]' : 'opacity-0',
                  )}
                >
                  {featured ? t('badge') : '—'}
                </p>

                <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.025em]">
                  {t(`${key}.name`)}
                </h3>
                <p className="mt-3 text-sm text-ink-faint">{t(`${key}.audience`)}</p>

                <ul className="mt-8 flex flex-col gap-4">
                  {featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex gap-3">
                      <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                      <span className="text-[0.9375rem] leading-relaxed text-ink-muted">
                        {t(`${key}.features.${featureKey}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-10">
                  <p className="type-figure text-2xl text-[var(--color-acento)] sm:text-[1.75rem]">
                    {t(`${key}.price`)}
                  </p>
                  <p className="mt-2 text-sm text-ink-faint">{t(`${key}.maintenance`)}</p>

                  <PackageCtaLink
                    packageKey={key as PackageKey}
                    variant={featured ? 'primary' : 'outline'}
                  >
                    {t(`${key}.cta`)}
                  </PackageCtaLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/*
        Right under the price panel — the ROI argument lands while the prices
        are still the freshest thing the visitor has seen, ahead of the "no
        fit" escape hatch below.
      */}
      <Reveal delay={0.2} className="mt-6">
        <CalculadoraAhorro />
      </Reveal>

      {/*
        Escape hatch for the visitor who does not fit any package. It sits right
        under the panel — the moment the mismatch is felt — and routes into the
        same single form as every other CTA, so there is still only one place to
        describe a case.
      */}
      <Reveal delay={0.28} className="mt-6">
        <div className="group relative overflow-hidden rounded-2xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_88%,transparent)] p-7 transition-[border-color,transform] duration-200 ease-out hover:border-[var(--accent-hairline)] motion-safe:hover:-translate-y-0.5 sm:p-9">
          {/* Draws itself across the top edge on hover — the brand spark, once. */}
          <span
            aria-hidden
            className="accent-rule absolute inset-x-0 top-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
          />

          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <div className="max-w-xl">
              <h3 className="text-lg font-semibold leading-snug tracking-[-0.02em]">
                {t('noFit.title')}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">
                {t('noFit.body')}
              </p>
            </div>

            <Button asChild size="lg" variant="outline" className="shrink-0">
              <a href={`#${sectionIds.finalCta}`}>
                {t('noFit.cta')}
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
                />
              </a>
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
