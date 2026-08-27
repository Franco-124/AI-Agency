import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

import { ServicesCarousel, type ServiceKey } from './ServicesCarousel'

/* Icons are resolved inside the carousel — a component cannot be serialised
   across the Server -> Client boundary, so only its key travels. */
const services: ReadonlyArray<{ key: ServiceKey; visual: string }> = [
  { key: 'zero', visual: '/images/28-services-diagnostic.webp' },
  { key: 'four', visual: '/images/23-services-website.webp' },
  { key: 'one', visual: '/images/25-services-whatsapp.webp' },
  { key: 'two', visual: '/images/24-services-calendar.webp' },
  { key: 'three', visual: '/images/22-services-followup.webp' },
  { key: 'five', visual: '/images/27-services-database.webp' },
]

export function Services() {
  const t = useTranslations('services')

  return (
    <Section
      id={sectionIds.services}
      labelledBy="servicios-titulo"
      surface="texture"
      backgroundSrc="/images/13-services-new.webp"
    >
      <Reveal>
        <SectionHeading id="servicios-titulo" title={t('title')} />
      </Reveal>

      {/* Copy is resolved here, on the server, so the interactive track stays a
          thin client island with no translation payload of its own. */}
      <Reveal delay={0.08}>
        <ServicesCarousel
          slides={services.map(({ key, visual }) => ({
            key,
            visual,
            title: t(`items.${key}.title`),
            body: t(`items.${key}.body`),
          }))}
          labels={{
            previous: t('carousel.previous'),
            next: t('carousel.next'),
            goTo: t('carousel.goTo'),
            region: t('carousel.region'),
          }}
        />
      </Reveal>
    </Section>
  )
}
