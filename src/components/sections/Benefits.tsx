import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

const benefitKeys = ['one', 'two', 'three', 'four'] as const

/**
 * What the business gains — four outcomes, each a claim plus its consequence.
 *
 * Previously a two-column `<table>`. The content is not tabular: there is no
 * shared axis to compare cells across, only four independent benefit/meaning
 * pairs, so the table semantics cost assistive tech a grid to navigate while
 * buying nothing. It also forced the "Beneficio / Qué significa" header row —
 * two labels the visitor has to read before reaching any actual value.
 *
 * Now an ordered list on a hairline grid: the benefit carries the weight, the
 * meaning sits under it as the payoff, and a large ordinal gives the block the
 * editorial rhythm the rest of the page uses. No card chrome — the hairlines
 * do the grouping, matching `Why`'s masthead treatment one section below.
 */
export function Benefits() {
  const t = useTranslations('benefits')

  return (
    <Section id={sectionIds.benefits} labelledBy="beneficios-titulo">
      <Reveal>
        <SectionHeading id="beneficios-titulo" title={t('title')} />
      </Reveal>

      {/*
        `divide-*` rather than per-item borders so no rule doubles up at the
        seams. Below `sm` the list is a single column split horizontally; from
        `sm` it becomes a 2x2 quadrant with both axes ruled.
      */}
      <ol className="mt-14 grid divide-y divide-hairline border-t border-hairline sm:grid-cols-2 sm:divide-x">
        {benefitKeys.map((key, index) => (
          <Reveal
            as="li"
            key={key}
            delay={index * 0.06}
            /*
              `sm:nth-child(-n+2)` would be the natural way to drop the top
              rule on the first row, but the top border lives on the parent —
              so instead every cell is padded uniformly and the grid's own
              divides handle separation.
            */
            className="group/benefit min-w-0 px-0 py-8 sm:px-8 sm:py-10 sm:first:pl-0 sm:[&:nth-child(3)]:pl-0"
          >
            <div className="flex items-baseline gap-4">
              <span
                aria-hidden
                className="type-figure shrink-0 text-[1.375rem] leading-none text-[var(--color-acento)] tabular-nums"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="min-w-0 text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] sm:text-lg">
                {t(`items.${key}.benefit`)}
              </h3>
            </div>
            {/* Indented to the headline's text column, not the ordinal's. */}
            <p className="mt-3 max-w-[34ch] pl-[2.375rem] text-[0.9375rem] leading-relaxed text-ink-muted">
              {t(`items.${key}.meaning`)}
            </p>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
