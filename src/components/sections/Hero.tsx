import { ArrowRight } from 'lucide-react'
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
        Static hero image: LCP element and the reduced-motion fallback. A
        violet flow that carries its light on the right half, where the chat
        card sits — the left stays near-black under the scrim below, so the
        headline keeps its contrast without the artwork being dimmed flat.

        Art-directed rather than one source scaled to both shapes. The hero is
        `min-h-dvh`, so on a tall phone `object-cover` on the landscape file
        would sample a ~500px-wide strip and stretch it past 2x — visibly soft,
        and it crops away the very light the artwork is for. The portrait file
        is a tall window taken from the same source, framed on that light.

        Plain <picture> because next/image has no media-query art direction;
        `fetchPriority`/`decoding` reproduce what `priority` would have set,
        and the explicit dimensions reserve the box so nothing shifts.
      */}
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/images/hero-violet-flow-portrait.webp"
          width={1080}
          height={2160}
        />
        <img
          src="/images/hero-violet-flow.webp"
          alt={t('imageAlt')}
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
      </picture>
      {/*
        Reading scrim, and it has to run in a different direction per layout.
        On desktop the copy sits in the left column, so the ramp goes left to
        right and clears early — the headline only needs cover to about a
        third of the width, and the artwork returns at full strength under the
        chat card. On a phone the copy spans the full width, so a sideways
        ramp would leave the subtitle over the bright side; there it runs top
        to bottom instead, covering the copy block and clearing below it.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-neutro-oscuro)_92%,transparent)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_78%,transparent)_45%,transparent_85%)] md:bg-[linear-gradient(to_right,color-mix(in_srgb,var(--color-neutro-oscuro)_97%,transparent)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_72%,transparent)_38%,color-mix(in_srgb,var(--color-neutro-oscuro)_28%,transparent)_68%,transparent_100%)]"
      />
      {/*
        Banded vignette: enough weight at the top and bottom edges to seat the
        header and the seam with the next section, clear through the middle.
        Kept lighter than a full dimming pass — the artwork carries the colour
        here, and the reading scrim above already protects the copy.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-neutro-oscuro)_70%,transparent)_0%,transparent_20%,transparent_72%,color-mix(in_srgb,var(--color-neutro-oscuro)_55%,transparent)_100%)]"
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
        <div className="min-w-0 lg:col-span-7">
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
            className="hero-rise type-display mt-7 max-w-full sm:max-w-[16ch]"
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
