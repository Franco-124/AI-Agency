import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { PulseBadge } from '@/components/motion/PulseBadge'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

type PackageDefinition = {
  key: 'one' | 'two' | 'three'
  featureKeys: readonly string[]
  featured: boolean
  /** Mobile order: the highlighted package leads the stack. */
  orderClass: string
}

const packages: readonly PackageDefinition[] = [
  {
    key: 'one',
    featureKeys: ['one', 'two', 'three'],
    featured: false,
    orderClass: 'order-2 lg:order-1',
  },
  {
    key: 'two',
    featureKeys: ['one', 'two', 'three'],
    featured: true,
    orderClass: 'order-1 lg:order-2',
  },
  {
    key: 'three',
    featureKeys: ['one', 'two', 'three', 'four'],
    featured: false,
    orderClass: 'order-3',
  },
]

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

      <ul className="mt-14 flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
        {packages.map(({ key, featureKeys, featured, orderClass }, index) => (
          <Reveal
            as="li"
            key={key}
            delay={index * 0.08}
            className={cn('h-full', orderClass)}
          >
            <article
              className={cn(
                'relative flex h-full flex-col rounded-2xl border p-7 sm:p-9',
                featured
                  ? 'border-[var(--accent-hairline)] bg-[var(--color-primario)] lg:-mt-4 lg:pb-11 lg:pt-11'
                  : 'border-hairline bg-[color-mix(in_srgb,var(--color-primario)_78%,transparent)]',
              )}
            >
              {featured ? (
                <>
                  <span aria-hidden className="accent-rule absolute inset-x-0 top-0" />
                  <PulseBadge className="absolute -top-3 left-7 sm:left-9">
                    {t('badge')}
                  </PulseBadge>
                </>
              ) : null}

              <h3
                className={cn(
                  'text-xl font-semibold leading-snug tracking-[-0.025em]',
                  featured && 'mt-2',
                )}
              >
                {t(`${key}.name`)}
              </h3>
              <p className="mt-3 text-sm text-ink-faint">{t(`${key}.audience`)}</p>

              <ul className="mt-8 flex flex-col gap-4">
                {featureKeys.map((featureKey) => (
                  <li key={featureKey} className="flex gap-3">
                    <Check
                      aria-hidden
                      className={cn(
                        'mt-0.5 h-4 w-4 shrink-0',
                        featured ? 'text-[var(--color-acento)]' : 'text-ink-faint',
                      )}
                    />
                    <span className="text-[0.9375rem] leading-relaxed text-ink-muted">
                      {t(`${key}.features.${featureKey}`)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <p
                  className={cn(
                    'text-lg font-semibold tracking-[-0.02em]',
                    featured ? 'text-[var(--color-acento)]' : 'text-ink',
                  )}
                >
                  {t(`${key}.price`)}
                </p>
                <p className="mt-2 text-sm text-ink-faint">{t(`${key}.maintenance`)}</p>
                <p className="mt-1 text-sm text-ink-faint">{t(`${key}.delivery`)}</p>

                <Button
                  asChild
                  block
                  size="lg"
                  variant={featured ? 'primary' : 'outline'}
                  className="mt-8"
                >
                  <a href={`#${sectionIds.finalCta}`}>{t('cta')}</a>
                </Button>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
