import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

const teamKeys = ['one', 'two', 'three', 'four', 'five'] as const

export function About() {
  const t = useTranslations('about')

  const facts = [
    { label: t('locationLabel'), value: t('location') },
    { label: t('missionLabel'), value: t('mission') },
    { label: t('visionLabel'), value: t('vision') },
  ]

  return (
    <section
      id={sectionIds.about}
      aria-labelledby="sobre-nosotros-titulo"
      className="grain relative isolate scroll-mt-24 overflow-hidden border-y border-hairline py-24 lg:py-32"
    >
      <Image
        src="/images/07-fondo-sobre-nosotros.webp"
        alt={t('imageAlt')}
        fill
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />
      {/*
        Only darkens the left half, where the copy sits — the warm glow in the
        top right of the artwork is the point of using this image at all.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-neutro-oscuro)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_78%,transparent)_45%,transparent_100%)]"
      />

      <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <h2 id="sobre-nosotros-titulo" className="type-section-title">
              {t('title')}
            </h2>
            <p className="type-lead mt-7">{t('body')}</p>

            <div className="mt-10">
              <h3 className="type-eyebrow">{t('teamLabel')}</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {teamKeys.map((key) => (
                  <li
                    key={key}
                    className="rounded-full border border-hairline bg-[var(--color-primario)] px-4 py-2 text-sm text-ink-muted"
                  >
                    {t(`team.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
            <dl className="flex flex-col">
              {facts.map((fact, index) => (
                <div
                  key={fact.label}
                  className={`py-8 ${index > 0 ? 'border-t border-hairline' : 'pt-0'}`}
                >
                  <dt className="type-eyebrow">{fact.label}</dt>
                  <dd className="mt-4 text-[0.9375rem] leading-relaxed text-ink sm:text-base">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
