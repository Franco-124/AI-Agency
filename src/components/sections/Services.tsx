import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

import { ServicesCarousel, type ServiceKey } from './ServicesCarousel'

/* Icons are resolved inside the carousel — a component cannot be serialised
   across the Server -> Client boundary, so only its key travels. */
const services: ReadonlyArray<{ key: ServiceKey; visual: string }> = [
  { key: 'zero', visual: '/images/28-services-diagnostic.webp' },
  { key: 'one', visual: '/images/25-services-whatsapp.webp' },
  { key: 'three', visual: '/images/22-services-followup.webp' },
  { key: 'five', visual: '/images/27-services-database.webp' },
  { key: 'four', visual: '/images/23-services-website.webp' },
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
        {/*
          Index but no eyebrow. The copy is fixed, and this section has no
          eyebrow string of its own — inventing one, or reusing the title as
          one, would either add copy or print the same words twice. The ordinal
          alone still does the job the index exists for: placing the block in
          the sequence.
        */}
        <SectionHeading
          id="servicios-titulo"
          index={1}
          title={t('title')}
          lead={t('lead')}
        />
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
