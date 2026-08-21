import { Eye, MapPin, Target, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

const teamKeys = ['one', 'two', 'three', 'four', 'five'] as const

export function About() {
  const t = useTranslations('about')

  /*
   * Location, mission and vision used to stack in a tall right-hand column
   * beside a short left one, which left a large hole under the copy at desktop
   * widths. They are three peer facts, so they read as three peer cards on one
   * row — the same icon-in-a-box card language as "Why" and "Services".
   */
  const facts: ReadonlyArray<{ label: string; value: string; Icon: LucideIcon }> = [
    { label: t('locationLabel'), value: t('location'), Icon: MapPin },
    { label: t('missionLabel'), value: t('mission'), Icon: Target },
    { label: t('visionLabel'), value: t('vision'), Icon: Eye },
  ]

  return (
    <section
      id={sectionIds.about}
      aria-labelledby="sobre-nosotros-titulo"
      className="grain relative isolate scroll-mt-24 overflow-hidden border-y border-hairline py-24 lg:py-32"
    >
      <Image
        src="/images/12-about-new.webp"
        alt={t('imageAlt')}
        fill
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />
      {/*
        Darkest where the headline and lead sit, easing off to the right so the
        warm glow in the artwork still reads. The cards carry their own surface,
        so they stay legible over the lighter end of the gradient.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-neutro-oscuro)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_84%,transparent)_48%,color-mix(in_srgb,var(--color-neutro-oscuro)_58%,transparent)_100%)]"
      />

      <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <h2 id="sobre-nosotros-titulo" className="type-section-title">
            {t('title')}
          </h2>
          <p className="type-lead mt-7">{t('body')}</p>
        </Reveal>

        {/*
          A colophon block, not a third set of icon cards: each fact is a
          plain label/value row separated by a hairline, the way a masthead
          lists its details — deliberately flatter than "Why" (hairline
          columns) and "Services" (icon cards) so no two sections in a row
          share a container language.
        */}
        <dl className="mt-14 divide-y divide-hairline border-y border-hairline">
          {facts.map(({ label, value, Icon }, index) => (
            <Reveal
              as="div"
              key={label}
              delay={0.08 + index * 0.06}
              className="grid gap-3 py-6 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-8"
            >
              <dt className="flex items-center gap-2.5 text-ink-faint">
                <Icon className="h-4 w-4 shrink-0 text-[var(--color-acento)]" strokeWidth={1.75} aria-hidden />
                <span className="type-eyebrow">{label}</span>
              </dt>
              <dd className="text-[0.9375rem] leading-relaxed text-ink sm:text-base">
                {value}
              </dd>
            </Reveal>
          ))}
        </dl>

        {/* The five names fill one strip instead of trailing off under the copy. */}
        <Reveal delay={0.26} className="mt-5">
          <div className="rounded-xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_92%,transparent)] p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
              <h3 className="type-eyebrow shrink-0">{t('teamLabel')}</h3>

              <ul className="flex flex-wrap gap-2">
                {teamKeys.map((key) => (
                  <li
                    key={key}
                    className="rounded-full border border-hairline bg-[var(--color-neutro-oscuro)] px-4 py-2 text-sm text-ink-muted"
                  >
                    {t(`team.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
