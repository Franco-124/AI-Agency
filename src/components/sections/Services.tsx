import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

import { ServiceCard, type ServiceKey } from './ServiceCard'

/*
  The five services, in the order they are sold.

  This used to be a scroll-snap carousel: five slides on a horizontal track
  with arrows, dots and a derived active index. A carousel is the right shape
  when a deck is too long to show at once — five cards are not. It cost a
  client island, hid four of the five behind a gesture, and dimmed everything
  that was not active, which is exactly the wrong treatment for a list where
  no single entry matters more than the others. The grid shows all five.
*/
const services: ReadonlyArray<{ key: ServiceKey; visual: string }> = [
  { key: 'diagnostic', visual: '/images/28-services-diagnostic.webp' },
  { key: 'chatbots', visual: '/images/25-services-whatsapp.webp' },
  { key: 'automation', visual: '/images/22-services-followup.webp' },
  { key: 'agents', visual: '/images/27-services-database.webp' },
  { key: 'websites', visual: '/images/23-services-website.webp' },
]

export function Services() {
  const t = useTranslations('services')

  return (
    <Section
      id={sectionIds.services}
      labelledBy="servicios-titulo"
      surface="texture"
      backgroundSrc="/images/13-services-new.webp"
      /* Measured as the LCP element on a phone: this section starts inside
         the first viewport, so its texture is the largest thing painted and
         was being lazy-loaded. */
      backgroundPriority
      /* The first block after the hero, and the one that answers "what is
         this". It opens at the widest rhythm so the transition out of the hero
         is an arrival rather than a step. */
      rhythm="wide"
      /* No top rule: the hero already closes with one, and two hairlines a few
         pixels apart is the seam this treatment exists to hide. */
      divided={false}
    >
      <Reveal>
        <SectionHeading
          id="servicios-titulo"
          index={1}
          title={t('title')}
          lead={t('lead')}
        />
      </Reveal>

      {/*
        Three columns, then two, then one.

        Five into three leaves the last row holding two cards rather than a
        lone orphan, which is why the deck is not four-up: `items-stretch` (the
        grid default) then levels every card in a row to the tallest, so the
        bodies can differ in length without the artwork drifting out of line.
      */}
      <ul className="mt-12 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
        {services.map(({ key, visual }, index) => (
          <Reveal key={key} as="li" delay={0.06 * index} className="h-full">
            <ServiceCard
              serviceKey={key}
              index={index}
              visual={visual}
              title={t(`items.${key}.title`)}
              body={t(`items.${key}.body`)}
            />
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
