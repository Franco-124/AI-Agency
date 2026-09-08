'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { faqKeys, sectionIds } from '@/lib/site'

/*
 * Native <details>/<summary> instead of the Radix accordion: Radix's
 * Accordion.Content unmounts the answer from the DOM while collapsed, so
 * the server-rendered HTML never contained the answer text — invisible to
 * answer engines and crawlers that don't execute JS. <details> keeps the
 * content node in the DOM at all times; only its rendered height collapses,
 * via the CSS grid-rows trick below (no JS state needed).
 */
export function Faq() {
  const t = useTranslations('faq')

  return (
    <Section id={sectionIds.faq} labelledBy="faq-titulo" surface="raised">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/*
          The heading column sticks on desktop. With eight questions the list
          runs well past a viewport, and a heading that scrolls away leaves the
          reader in an unlabelled stack of disclosures. It is `lg`-only: on a
          phone a sticky heading would eat the screen the answers need.
        */}
        <Reveal className="lg:col-span-4 lg:self-start lg:sticky lg:top-[calc(var(--header-height)+3rem)]">
          <SectionHeading id="faq-titulo" index={9} title={t('title')} />
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-8">
          <div className="w-full border-t border-hairline-subtle">
            {faqKeys.map((key) => (
              <details
                key={key}
                className="group border-b border-hairline-subtle"
              >
                {/*
                  `-mx-*` plus matching padding widens the row's hit area and
                  its hover wash to the full column, so the target is the row
                  rather than the text — while the copy stays optically aligned
                  with the heading beside it.
                */}
                <summary className="-mx-3 flex cursor-pointer list-none items-start justify-between gap-6 rounded-lg px-3 py-5 text-left text-[0.9375rem] font-medium leading-snug text-ink transition-colors duration-200 [&::-webkit-details-marker]:hidden hover:bg-[color-mix(in_srgb,var(--color-acento)_5%,transparent)] group-open:text-[var(--accent-text)] sm:py-6 sm:text-base">
                  {t(`items.${key}.question`)}
                  {/*
                    The glyph is seated in a tile that fills with the accent
                    wash when open, so the open row is legible as open from the
                    control alone — a rotated stroke on its own reads as a
                    hover artefact more than as a state.
                  */}
                  <span
                    aria-hidden
                    className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-hairline transition-colors duration-300 group-open:border-[var(--accent-hairline)] group-open:bg-[var(--accent-soft)]"
                  >
                    <Plus
                      className="h-3.5 w-3.5 text-ink-faint transition-[transform,color] duration-300 ease-[var(--ease-emphasis)] group-open:rotate-45 group-open:text-[var(--accent-text)]"
                      strokeWidth={2}
                    />
                  </span>
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[260ms] ease-[var(--ease-emphasis)] group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="type-body max-w-[60ch] pb-6 pr-10">
                      {t(`items.${key}.answer`)}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
