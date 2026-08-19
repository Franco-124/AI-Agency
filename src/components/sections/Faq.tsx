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
        <Reveal className="lg:col-span-4">
          <SectionHeading id="faq-titulo" title={t('title')} />
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-8">
          <div className="w-full">
            {faqKeys.map((key) => (
              <details
                key={key}
                className="group border-b border-hairline last:border-b-0"
              >
                <summary className="flex flex-1 cursor-pointer list-none items-start justify-between gap-6 py-6 text-left text-base font-medium leading-snug text-ink transition-colors duration-200 [&::-webkit-details-marker]:hidden hover:text-[var(--color-acento)] sm:text-lg">
                  {t(`items.${key}.question`)}
                  <Plus
                    aria-hidden
                    className="mt-0.5 h-5 w-5 shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-45 group-open:text-[var(--color-acento)]"
                  />
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[240ms] ease-out group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="pb-7 pr-11 text-[0.9375rem] leading-relaxed text-ink-muted">
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
