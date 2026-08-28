import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

import { ServicesCarousel, type ServiceKey } from './ServicesCarousel'

/* Icons are resolved inside the carousel — a component cannot be serialised
   across the Server -> Client boundary, so only its key travels. */
/* The two web slides run back to back on purpose: the site is the offer, and
   the campaign page is what turns paid traffic into a conversation on it. */
const services: ReadonlyArray<{ key: ServiceKey; visual: string }> = [
  { key: 'zero', visual: '/images/28-services-diagnostic.webp' },
  { key: 'four', visual: '/images/23-services-website.webp' },
  { key: 'two', visual: '/images/29-services-landing.webp' },
  { key: 'one', visual: '/images/25-services-whatsapp.webp' },
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
      /* Pinned to the original rhythm: this section's spacing is deliberate
         and is excluded from the page-wide reduction below it. */
      className="py-24 lg:py-32"
    >
      <Reveal>
        <SectionHeading id="servicios-titulo" title={t('title')} />
      </Reveal>

      {/* Copy is resolved here, on the server, so the interactive track stays a
          thin client island with no translation payload of its own. */}
      <Reveal delay={0.08}>
        <ServicesCarousel
          slides={services.map(({ key, visual }, index) => ({
            key,
            visual,
            title: t(`items.${key}.title`),
            body: t(`items.${key}.body`),
            /*
              Formatted here rather than shipped as a template: `goTo` carries
              ICU placeholders, so next-intl resolves it — applying the locale's
              own number rules — instead of the client string-replacing it.
            */
            label: t('carousel.goTo', {
              index: index + 1,
              total: services.length,
            }),
          }))}
          labels={{
            previous: t('carousel.previous'),
            next: t('carousel.next'),
            region: t('carousel.region'),
          }}
        />
      </Reveal>
    </Section>
  )
}
