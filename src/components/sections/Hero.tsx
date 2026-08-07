import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react'

import { HeroMotion } from '@/components/motion/HeroMotion'
import { HeroChatCard } from '@/components/sections/HeroChatCard'
import { Button } from '@/components/ui/button'
import { sectionIds } from '@/lib/site'

const indicatorKeys = ['one', 'two', 'three'] as const

export function Hero() {
  const t = useTranslations('hero')
  const tButtons = useTranslations('buttons')

  return (
    <section id={sectionIds.hero} className="relative isolate overflow-hidden">
      {/* Static hero image: LCP element and the reduced-motion fallback. */}
      <Image
        src="/images/01-hero-bg-abstracto.webp"
        alt={t('imageAlt')}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-neutro-oscuro)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_82%,transparent)_55%,transparent_100%)]"
      />

      {/*
        The spark is confined to the bottom band of the hero, so the beam can
        never cross the headline at any breakpoint.
      */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[32%]">
        <HeroMotion />
      </div>

      <div className="mx-auto grid min-h-dvh max-w-[80rem] items-center gap-14 px-5 pb-16 pt-[calc(var(--header-height)+3rem)] sm:px-8 lg:grid-cols-12 lg:gap-10 lg:pb-24">
        <div className="lg:col-span-7">
          <p className="type-eyebrow inline-flex items-center gap-2.5">
            <span aria-hidden className="h-px w-8 bg-[var(--color-acento)]" />
            {t('eyebrow')}
          </p>

          <h1 className="type-display mt-7 max-w-[16ch]">{t('title')}</h1>

          <p className="type-lead mt-7 max-w-[52ch]">{t('subtitle')}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="group">
              <a href={`#${sectionIds.finalCta}`}>
                {t('cta')}
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`#${sectionIds.services}`}>{tButtons('seeHowItWorks')}</a>
            </Button>
          </div>

          {/* Indicator bar: one wrapping row separated by middots. */}
          <ul className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8125rem] text-[color-mix(in_srgb,var(--color-neutro-claro)_65%,transparent)]">
            {indicatorKeys.map((key, index) => (
              <Fragment key={key}>
                {index > 0 ? (
                  <li aria-hidden className="text-[var(--color-acento)]">
                    ·
                  </li>
                ) : null}
                <li>{t(`indicators.${key}`)}</li>
              </Fragment>
            ))}
          </ul>
        </div>

        {/* Product proof — desktop only, so it never pushes the mobile CTA down. */}
        <div className="hidden lg:col-span-5 lg:block">
          <HeroChatCard />
        </div>
      </div>
    </section>
  )
}
