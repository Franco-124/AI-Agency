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
        <SectionHeading id="beneficios-titulo" index={3} title={t('title')} />
      </Reveal>

      {/*
        `divide-*` rather than per-item borders so no rule doubles up at the
        seams. Below `sm` the list is a single column split horizontally; from
        `sm` it becomes a 2x2 quadrant with both axes ruled.
      */}
      <ol className="mt-12 grid divide-y divide-hairline-subtle border-t border-hairline-subtle sm:mt-14 sm:grid-cols-2 sm:divide-x">
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

              The quadrant now lights up under the pointer: a very faint accent
              wash on the cell plus the ordinal filling in. It is the cheapest
              way to make a ruled grid feel like an interface rather than a
              printed table, and it costs no layout — background and colour only.
            */
            className="group/benefit relative min-w-0 px-0 py-7 transition-colors duration-300 sm:px-8 sm:py-10 sm:first:pl-0 sm:[&:nth-child(3)]:pl-0 sm:hover:bg-[color-mix(in_srgb,var(--color-acento)_4%,transparent)]"
          >
            <div className="flex items-baseline gap-3.5">
              {/*
                Hollow at rest, filled on hover. The outline keeps four large
                ordinals from out-shouting the four claims they number, and the
                fill is what rewards the pointer landing on the cell.
              */}
              <span
                aria-hidden
                className="type-figure shrink-0 text-[1.25rem] leading-none tabular-nums text-transparent transition-colors duration-300 [-webkit-text-stroke:1px_var(--accent-hairline)] group-hover/benefit:text-[var(--accent-text)] group-hover/benefit:[-webkit-text-stroke:1px_transparent]"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="min-w-0 text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] sm:text-lg">
                {t(`items.${key}.benefit`)}
              </h3>
            </div>
            {/* Indented to the headline's text column, not the ordinal's. */}
            <p className="type-body mt-2.5 max-w-[36ch] pl-[2.1875rem]">
              {t(`items.${key}.meaning`)}
            </p>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
