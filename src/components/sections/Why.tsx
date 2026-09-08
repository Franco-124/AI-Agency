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

      <ul className="mt-16 grid min-w-0 divide-y divide-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {pillars.map(({ key, Icon }, index) => (
          <Reveal
            as="li"
            key={key}
            delay={index * 0.06}
            className={cn(
              'min-w-0 flex flex-col gap-4 py-8 sm:px-8 sm:py-0 first:sm:pl-0 last:sm:pr-0',
            )}
          >
            <Icon
              className="h-6 w-6 text-[var(--color-acento)]"
              strokeWidth={1.5}
              aria-hidden
            />
            {/*
              Stepped down from `.type-section-title` (which tops out at
              3.25rem) to a fixed pillar scale. At the section-title size these
              three ran to three and four lines inside a one-third column and
              competed with the h2 directly above them — two headings of the
              same weight, one screen apart. They are subheads, so they now
              read as such.
            */}
            <h3 className="min-w-0 break-words font-display text-xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[1.375rem]">
              {t(`pillars.${key}.title`)}
            </h3>
            {/* `max-w-[34ch]`: at 26ch the third pillar's body broke to five
                very short lines in a column wide enough for three. */}
            <p className="max-w-[34ch] text-[0.9375rem] leading-relaxed text-ink-muted">
              {t(`pillars.${key}.body`)}
            </p>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
