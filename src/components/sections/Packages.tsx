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
  key: PackageKey
  featureKeys: readonly string[]
  featured: boolean
}

export const packages: readonly PackageDefinition[] = [
  { key: 'one', featureKeys: ['one', 'two', 'three'], featured: false },
  { key: 'two', featureKeys: ['one', 'two', 'three'], featured: true },
  { key: 'three', featureKeys: ['one', 'two', 'three', 'four'], featured: false },
]

/**
 * Three packages, one panel. Earlier this was three isolated cards with the
 * middle one elevated, bordered and badge-pinned — the single most recognizable
 * "AI-generated SaaS pricing table" pattern there is. All three now carry equal
 * visual weight, divided by hairlines like one comparison panel; the accent is
 * spent only on the two things a buyer actually compares — the price, and which
 * one most other clients pick — never on card chrome.
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
          <ul className="grid divide-y divide-hairline lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {packages.map(({ key, featureKeys, featured }) => (
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

                {/* Aclaratoria, no un feature más — por eso vive fuera de la
                    lista de bullets, sin ícono de check. */}
                {key === 'three' ? (
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-faint">
                    {t('three.crossSell')}
                  </p>
                ) : null}

                <div className="mt-auto pt-10">
                  <p className="type-figure text-2xl text-[var(--color-acento)] sm:text-[1.75rem]">
                    {t(`${key}.price`)}
                  </p>
                  <p className="mt-2 text-sm text-ink-faint">{t(`${key}.maintenance`)}</p>
                  <p className="mt-1 text-sm text-ink-faint">{t(`${key}.delivery`)}</p>

                  <PackageCtaLink
                    packageKey={key}
                    variant={featured ? 'primary' : 'outline'}
                  >
                    {t('cta')}
                  </PackageCtaLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/*
        Escape hatch for the visitor who does not fit any package. It sits right
        under the panel — the moment the mismatch is felt — and routes into the
        same single form as every other CTA, so there is still only one place to
        describe a case.
      */}
      <Reveal delay={0.24} className="mt-6">
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

      <Reveal delay={0.32} className="mt-6">
        <CalculadoraAhorro />
      </Reveal>
    </Section>
  )
}
