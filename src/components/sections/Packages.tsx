import { ArrowRight, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { AdvisoryCtaLink } from '@/components/sections/AdvisoryCtaLink'
import { CalculadoraAhorro } from '@/components/sections/CalculadoraAhorro'
import { PackageCtaLink } from '@/components/sections/PackageCtaLink'
import { Button } from '@/components/ui/button'
import type { PackageKey } from '@/lib/package-interest'
import { priceClasses, priceScale } from '@/lib/price-display'
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

type PackageCardProps = {
  definition: PackageDefinition
  t: ReturnType<typeof useTranslations>
  /** Rendered under the feature list — the website tier's disambiguation note. */
  note?: ReactNode
  /** The card's action. The website tier has no interest tracking to record. */
  action: ReactNode
}

/**
 * One offer card.
 *
 * Extracted because the website tier and the three AI systems previously
 * duplicated this entire markup block verbatim — two copies that had to be
 * edited in lockstep for every spacing or a11y change.
 *
 * Two fixes ride along:
 *
 * 1. The "Más elegido" badge used to render a literal em dash at `opacity-0`
 *    on non-featured cards, purely to reserve its line height. Screen readers
 *    announced that dash on three of four cards. The reservation is now an
 *    empty `aria-hidden` box, so only the real badge has any text at all.
 * 2. The featured tier was distinguished by eyebrow colour alone — invisible
 *    at a glance. It now also carries a tinted surface and an accent hairline,
 *    which is as far as the emphasis goes: no scale transform, no coloured
 *    fill, no "LIMITED" urgency.
 */
function PackageCard({ definition, t, note, action }: PackageCardProps) {
  const { key, featureKeys, featured } = definition
  const price = t(`${key}.price`)

  return (
    <li
      className={cn(
        'relative flex flex-col p-6 sm:p-8',
        /* The featured tier is tinted and lit along its top edge rather than
           outlined in accent — see `.surface-card-featured` for why. */
        featured &&
          'bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-acento)_9%,transparent)_0%,color-mix(in_srgb,var(--color-acento)_2%,transparent)_60%,transparent_100%)]',
      )}
    >
      {/* The lit top edge of the featured card. Sits inside the panel's own
          rounding, so it reads as this cell being lifted rather than as a
          rule drawn across the panel. */}
      {featured ? (
        <span
          aria-hidden
          className="accent-rule absolute inset-x-0 top-0 opacity-70"
        />
      ) : null}

      {featured ? (
        <p className="type-eyebrow flex h-4 items-center gap-2 text-[var(--accent-text)]">
          <span
            aria-hidden
            className="h-1 w-1 rounded-full bg-[var(--color-acento)]"
          />
          {t('badge')}
        </p>
      ) : (
        /* Keeps every card's title on the same baseline without emitting text. */
        <span aria-hidden className="block h-4" />
      )}

      <h3 className="mt-3.5 font-display text-[1.1875rem] font-medium leading-snug tracking-[-0.025em] sm:text-xl">
        {t(`${key}.name`)}
      </h3>
      <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-faint">
        {t(`${key}.audience`)}
      </p>

      {/* Separated from the pitch above by a hairline: the card now has two
          readable zones (what it is / what you get) instead of one column of
          evenly-spaced text. */}
      <ul className="mt-6 flex flex-col gap-3.5 border-t border-hairline-subtle pt-6">
        {featureKeys.map((featureKey) => (
          <li key={featureKey} className="flex gap-2.5">
            {/*
              The tick sits in a small seated square rather than floating as a
              bare stroke. Four loose ticks per card across four cards is
              sixteen unanchored glyphs; the tile groups each one with its line.
            */}
            <span
              aria-hidden
              className={cn(
                'mt-[0.1875rem] flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-[0.3125rem] border',
                featured
                  ? 'border-[var(--accent-hairline)] bg-[var(--accent-soft)]'
                  : 'border-hairline bg-[var(--surface-inset)]',
              )}
            >
              <Check
                className={cn(
                  'h-[0.6875rem] w-[0.6875rem]',
                  featured ? 'text-[var(--accent-text)]' : 'text-ink-muted',
                )}
                strokeWidth={2.5}
              />
            </span>
            <span className="type-body text-[0.9375rem]">
              {t(`${key}.features.${featureKey}`)}
            </span>
          </li>
        ))}
      </ul>

      {note}

      {/* `mt-auto` pins price + CTA to the card's floor, so the three system
          cards keep their prices on one line however unevenly the feature
          lists wrap. */}
      <div className="mt-auto border-t border-hairline-subtle pt-7">
        {/* Figure scale or phrase scale, chosen from the string's own length
            — see `priceScale`. Shared with `Advisory`, which mixes the same
            two shapes under one key. */}
        <p
          className={cn(
            'text-[var(--accent-text)]',
            priceClasses[priceScale(price)],
          )}
        >
          {price}
        </p>
        <p className="mt-1.5 text-[0.8125rem] text-ink-faint">
          {t(`${key}.maintenance`)}
        </p>
        {action}
      </div>
    </li>
  )
}

/** Shared shell for both offer panels. */
function PackagePanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="surface-panel overflow-hidden rounded-[1.125rem]">
      <ul className={cn('divide-y divide-hairline-subtle', className)}>
        {children}
      </ul>
    </div>
  )
}

/**
 * The standalone website offer leads, followed by the three AI systems under
 * their own heading. The cards keep one shared visual language and are left to
 * differentiate themselves through their scope and their price — the prose
 * that used to explain the pricing variables above them said the same thing
 * twice, and said it before the visitor had seen a figure.
 */
export function Packages() {
  const t = useTranslations('packages')

  const [websiteOffer, ...systemOffers] = packages

  return (
    // The offer. Widest rhythm on the page — this is where the visitor is
    // asked to weigh money, and the block needs room to be read slowly.
    <Section
      id={sectionIds.packages}
      labelledBy="paquetes-titulo"
      surface="texture"
      rhythm="wide"
    >
      <Reveal>
        <SectionHeading
          id="paquetes-titulo"
          index={6}
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />
      </Reveal>

      <Reveal delay={0.1} className="mt-14">
        <PackagePanel>
          <PackageCard
            definition={websiteOffer}
            t={t}
            note={
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-faint">
                {t('website.note')}
              </p>
            }
            /* Carries its own interest key, so the form below arrives with
               "Sitio Web Profesional" already picked — the same hand-off the
               two advisory offers use. The three automation tiers still do
               not pre-select anything: which of the three is a real decision
               the visitor has not necessarily made yet. */
            action={
              <AdvisoryCtaLink interestKey="website" variant="outline">
                {t('website.cta')}
              </AdvisoryCtaLink>
            }
          />
        </PackagePanel>

        {/*
          Heading only, introducing the three system tiers below it.

          It used to carry a lead paragraph, a four-item list of what moves the
          price, and a closing note — roughly 540 characters explaining pricing
          variables before the visitor had seen a single price. The three cards
          immediately below already state their scope and their figure, so the
          list was pre-empting them with the same information in prose.

          With one line of text the accent rule down the left edge went too:
          that treatment marked a block of prose as an aside, and there is no
          longer a block to mark. It is now a plain subsection heading, paired
          with the eyebrow rule every other heading on the page uses.
        */}
        <div className="mt-12 flex items-center gap-3 sm:mt-14">
          <span
            aria-hidden
            className="h-px w-7 shrink-0 bg-[var(--accent-hairline)]"
          />
          <h3 className="font-display text-[1.1875rem] font-medium leading-snug tracking-[-0.025em] sm:text-xl">
            {t('systems.title')}
          </h3>
        </div>

        <div className="mt-6">
          <PackagePanel className="lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {systemOffers.map((definition) => (
              <PackageCard
                key={definition.key}
                definition={definition}
                t={t}
                action={
                  <PackageCtaLink
                    packageKey={definition.key as PackageKey}
                    variant={definition.featured ? 'primary' : 'outline'}
                  >
                    {t(`${definition.key}.cta`)}
                  </PackageCtaLink>
                }
              />
            ))}
          </PackagePanel>
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
        <div className="surface-panel lift group relative overflow-hidden rounded-[1.125rem] p-6 sm:p-8">
          {/* Draws itself across the top edge on hover — the brand spark, once. */}
          <span
            aria-hidden
            className="accent-rule absolute inset-x-0 top-0 origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-emphasis)] group-hover:scale-x-100"
          />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <div className="max-w-xl">
              <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] sm:text-lg">
                {t('noFit.title')}
              </h3>
              <p className="type-body mt-2.5">{t('noFit.body')}</p>
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
