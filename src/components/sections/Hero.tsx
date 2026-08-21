import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Fragment, type CSSProperties } from 'react'

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
      {/*
        Static hero image: LCP element and the reduced-motion fallback. Kept as
        the shared site texture rather than the old abstract "beam" artwork —
        the argument now lives in the WhatsApp thread beside the copy, so the
        background only needs to be an honest surface, not a stand-in symbol.
      */}
      <Image
        src="/images/16-hero-original.webp"
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
        Banded vignette over the network canvas: heavier at the top and
        bottom edges (where the header sits and where the section meets the
        next one) and near-clear through the middle, so the animated nodes
        stay visible without ever competing with the headline's contrast.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-neutro-oscuro)_85%,transparent)_0%,transparent_22%,transparent_68%,color-mix(in_srgb,var(--color-neutro-oscuro)_70%,transparent)_100%)]"
      />

      {/*
        Ambient layer: the drawn diagonal plus a slow particle field. It sits
        behind all copy and nothing in it moves fast enough to compete with the
        headline for attention.
      */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <HeroMotion />
      </div>

      <div className="mx-auto grid min-h-dvh max-w-[80rem] items-center gap-14 px-5 pb-16 pt-[calc(var(--header-height)+3rem)] sm:px-8 lg:grid-cols-12 lg:gap-10 lg:pb-24">
        {/*
          Load sequence: the block rises in reading order — eyebrow, headline,
          subtitle, actions, indicators — so the eye is led down to the CTA
          instead of meeting the whole hero at once. Delays are declared per
          element with `--hero-delay`; the animation itself is one shared class.
        */}
        <div className="lg:col-span-7">
          <p
            className="hero-rise type-eyebrow inline-flex items-center gap-2.5"
            style={{ '--hero-delay': '0.05s' } as CSSProperties}
          >
            <span
              aria-hidden
              className="rule-grow h-px w-8 bg-[var(--surface-border-strong)]"
              style={{ '--hero-delay': '0.25s' } as CSSProperties}
            />
            {t('eyebrow')}
          </p>

          <h1
            className="hero-rise type-display mt-7 max-w-[16ch]"
            style={{ '--hero-delay': '0.12s' } as CSSProperties}
          >
            {t('title')}
          </h1>

          <p
            className="hero-rise type-lead mt-7 max-w-[52ch]"
            style={{ '--hero-delay': '0.22s' } as CSSProperties}
          >
            {t('subtitle')}
          </p>

          <div
            className="hero-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ '--hero-delay': '0.32s' } as CSSProperties}
          >
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
          <ul
            className="hero-rise mt-9 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8125rem] text-[color-mix(in_srgb,var(--color-neutro-claro)_65%,transparent)]"
            style={{ '--hero-delay': '0.42s' } as CSSProperties}
          >
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

        {/* Product proof — desktop only, so it never pushes the mobile CTA down.
            The float lives on this wrapper because the card animates its own
            entrance; stacking both on one element would fight over `transform`. */}
        <div className="soft-float hidden lg:col-span-5 lg:block">
          <HeroChatCard />
        </div>
      </div>
    </section>
  )
}
