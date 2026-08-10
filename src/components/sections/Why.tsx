import { Handshake, Puzzle, TrendingUp, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

const pillars: ReadonlyArray<{ key: string; Icon: LucideIcon }> = [
  { key: 'one', Icon: TrendingUp },
  { key: 'two', Icon: Puzzle },
  { key: 'three', Icon: Handshake },
]

/**
 * Three reasons to choose Numi AI, not three features of the product — so
 * unlike "Cómo trabajamos con tu negocio" (a card grid of things it *does*),
 * these read as an editorial masthead spread: hairline-divided columns with
 * no card chrome, closer to a manifesto than a feature list.
 */
export function Why() {
  const t = useTranslations('why')

  return (
    <Section id={sectionIds.why} labelledBy="por-que-titulo">
      <Reveal>
        <SectionHeading id="por-que-titulo" title={t('title')} />
      </Reveal>

      <ul className="mt-16 grid divide-y divide-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {pillars.map(({ key, Icon }, index) => (
          <Reveal
            as="li"
            key={key}
            delay={index * 0.06}
            className={cn(
              'flex flex-col gap-4 py-8 sm:px-8 sm:py-0 first:sm:pl-0 last:sm:pr-0',
            )}
          >
            <Icon
              className="h-6 w-6 text-[var(--color-acento)]"
              strokeWidth={1.5}
              aria-hidden
            />
            <h3 className="type-section-title text-2xl sm:text-[1.75rem]">
              {t(`pillars.${key}.title`)}
            </h3>
            <p className="max-w-[26ch] text-[0.9375rem] leading-relaxed text-ink-muted">
              {t(`pillars.${key}.body`)}
            </p>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
