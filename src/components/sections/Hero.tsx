import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  Globe,
  MessageCircle,
  MousePointerClick,
  Users,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'

import { HeroMotion } from '@/components/motion/HeroMotion'
import { Button } from '@/components/ui/button'
import { sectionIds } from '@/lib/site'

/** The four capabilities in the icon row, in reading order. */
const heroFeatures: ReadonlyArray<{ key: string; Icon: LucideIcon }> = [
  { key: 'one', Icon: MessageCircle },
  { key: 'two', Icon: CalendarClock },
  { key: 'three', Icon: Users },
  { key: 'four', Icon: Globe },
]

export function Hero() {
  const t = useTranslations('hero')

  return (
    <section id={sectionIds.hero} className="relative isolate overflow-hidden">
      {/*
        Static hero image: LCP element and the reduced-motion fallback. A
        violet flow that carries its light on the right half, where the flow
        diagram sits — the left stays near-black under the scrim below, so the
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
        flow diagram. On a phone the copy spans the full width, so a sideways
        ramp would leave the subtitle over the bright side; there it runs top
        to bottom instead, covering the copy block and clearing below it.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-neutro-oscuro)_94%,transparent)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_86%,transparent)_45%,color-mix(in_srgb,var(--color-neutro-oscuro)_60%,transparent)_100%)] md:bg-[linear-gradient(to_right,color-mix(in_srgb,var(--color-neutro-oscuro)_98%,transparent)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_88%,transparent)_38%,color-mix(in_srgb,var(--color-neutro-oscuro)_66%,transparent)_68%,color-mix(in_srgb,var(--color-neutro-oscuro)_58%,transparent)_100%)]"
      />
      {/*
        Banded vignette: enough weight at the top and bottom edges to seat the
        header and the seam with the next section, clear through the middle.
        Kept lighter than a full dimming pass — the artwork carries the colour
        here, and the reading scrim above already protects the copy.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-neutro-oscuro)_82%,transparent)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_30%,transparent)_20%,color-mix(in_srgb,var(--color-neutro-oscuro)_30%,transparent)_72%,color-mix(in_srgb,var(--color-neutro-oscuro)_70%,transparent)_100%)]"
      />

      {/*
        Brightness governor. The artwork's own hotspot sits high and right —
        over empty space — which pulled the eye away from both the headline and
        the figure. This radial keeps a clear window centred on the figure column
        (72% across, 58% down) and dims everything outside it, so the brightest
        part of the hero ends up behind the figure rather than beside it. Pure
        `--color-neutro-oscuro` at varying alpha, so no hue is introduced and
        the artwork cannot drift toward magenta.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(65%_60%_at_72%_58%,transparent_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_22%,transparent)_45%,color-mix(in_srgb,var(--color-neutro-oscuro)_55%,transparent)_100%)]"
      />

      {/*
        Ambient layer: the drawn diagonal plus a slow particle field. It sits
        behind all copy and nothing in it moves fast enough to compete with the
        headline for attention.
      */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <HeroMotion />
      </div>

      {/*
        Product proof — desktop only, so it never pushes the mobile CTA down.

        Positioned against the section rather than placed in the grid: inside
        the 5/12 column the diagram was capped at ~26rem, which rendered its
        own labels below a legible size. Anchored here it can run from the
        middle of the page out past the container's `max-w-[80rem]` to the
        viewport edge, which is the width its content actually needs.

        It starts a little before the halfway mark and runs to the page edge.
        The copy column is held to 7/12 and the subtitle to 44ch on `lg`, so
        the two never collide despite the overlap in horizontal bands — the
        left of the figure is transparent under the mask anyway. Vertically it
        is centred on the hero below the header, matching the copy block.

        No plate, no border, no corner radius: the diagram reads as part of the
        hero backdrop rather than as a card sitting on top of it. What replaces
        the panel is a mask — the artwork's own near-black ground (#000012-ish
        in the corners) is close enough to `--color-neutro-oscuro` that fading
        the edges to transparent hides the rectangle entirely, so the figure
        dissolves into the background instead of being framed by it.

        Three masks intersect. The ellipse does the general softening; the
        horizontal ramp adds a longer fade on the left, where the figure meets
        the copy column and the seam would be most visible; the vertical ramp
        clears the top and bottom edges, which the ellipse alone left as a
        hard horizontal line across the artwork.

        `-z-10` keeps it behind the copy, and `pointer-events-none` keeps it
        out of the way of the CTAs that overlap it at narrower desktop widths.
      */}
      <div className="pointer-events-none absolute inset-y-0 left-[46%] right-0 -z-10 hidden items-center lg:flex 2xl:left-[43%] 2xl:right-[1vw]">
        <div className="soft-float w-full [mask-composite:intersect] [mask-image:radial-gradient(82%_86%_at_52%_50%,#000_42%,transparent_100%),linear-gradient(to_right,transparent_0%,#000_22%),linear-gradient(to_bottom,transparent_0%,#000_11%,#000_89%,transparent_100%)]">
          {/*
            `sizes` is capped at the widest the figure can actually get — half
            the viewport — so the optimizer never serves a source larger than
            it renders. No `priority`: the LCP element is the backdrop above,
            and this sits below it in the paint order.
          */}
          <Image
            src="/images/hero-flow-diagram.webp"
            alt={t('flowImageAlt')}
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 56vw, 0px"
            className="h-auto w-full"
          />
        </div>
      </div>

      {/*
        The hero keeps the site-wide `max-w-[80rem]` up to `2xl` so its copy
        starts on the same left edge as every section below it. Past that the
        cap is raised and the gutter switches to a percentage: on a 1920px
        monitor the fixed container left ~345px of empty black down the left
        side while the figure had nowhere left to grow. Widening only above
        `2xl` buys that space back at the sizes where it is wasted, without
        moving the alignment at the widths most people actually browse at.
      */}
      <div className="mx-auto grid min-h-dvh max-w-[80rem] items-center gap-14 px-5 pb-16 pt-[calc(var(--header-height)+3rem)] sm:px-8 lg:grid-cols-12 lg:gap-10 lg:pb-24 2xl:max-w-[132rem] 2xl:px-[clamp(5rem,7.5vw,11rem)]">
        {/*
          Load sequence: the block rises in reading order — eyebrow, headline,
          subtitle, actions, indicators — so the eye is led down to the CTA
          instead of meeting the whole hero at once. Delays are declared per
          element with `--hero-delay`; the animation itself is one shared class.
        */}
        <div className="flex min-w-0 flex-col lg:col-span-7">
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

          {/*
            The headline is assembled from parts rather than held as one string
            because two words carry the accent colour. Splitting it in the
            message file — instead of embedding markup in the translation —
            keeps the copy translatable without letting HTML into it, and lets
            each locale decide where its own emphasis falls.

            The size override tunes `type-display` for this specific block
            rather than accepting its shared clamp. The ceiling sits under the
            token's 5.25rem so three lines still fit a laptop viewport
            alongside the subtitle, feature row and CTAs, and the floor is
            raised above the token's 2.25rem because the headline is the only
            thing carrying the top of a phone screen.
          */}
          <h1
            className="hero-rise type-display mt-5 max-w-full text-[clamp(2.1rem,1.5rem+3.6vw,4.05rem)] sm:mt-7 sm:max-w-[19ch] lg:max-w-[17ch] 2xl:max-w-[16ch] 2xl:text-[4.35rem]"
            style={{ '--hero-delay': '0.12s' } as CSSProperties}
          >
            {t('title.lead')}{' '}
            <span className="text-[var(--color-acento)]">
              {t('title.highlightOne')}
            </span>
            {t('title.middle')}{' '}
            <span className="text-[var(--color-acento)]">
              {t('title.highlightTwo')}
            </span>
            {t('title.tail')}
          </h1>

          <p
            className="hero-rise type-lead mt-5 max-w-[52ch] sm:mt-7 lg:max-w-[44ch] lg:text-[1.1875rem] 2xl:max-w-[46ch] 2xl:text-[1.25rem]"
            style={{ '--hero-delay': '0.22s' } as CSSProperties}
          >
            {t('subtitle')}
          </p>

          {/*
            Four capabilities as an icon row. This is the one place in the hero
            that says what Numi actually does — the headline sells the outcome
            and the subtitle the category, so without it a first-time visitor
            reaches the CTA without having seen a single concrete deliverable.
            Two columns on a phone; from `sm` up it is a flex row rather than
            a four-column grid, so each item takes the width of its own label
            instead of an equal quarter of the container — on a wide monitor
            the grid pulled the four items far apart.

            `order-3` drops it below the CTAs on phones. As two rows of text it
            costs ~120px, which was enough to push both buttons past the fold
            on a 667px-tall screen — the CTAs are the action, the features are
            the reinforcement, so on a small screen the action goes first. DOM
            order is unchanged, so the reading and tab order still run
            headline, subtitle, features, CTAs.
          */}
          <ul
            className="hero-rise order-3 mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:order-none sm:flex sm:flex-wrap sm:gap-x-8 lg:gap-x-9"
            style={{ '--hero-delay': '0.28s' } as CSSProperties}
          >
            {heroFeatures.map(({ key, Icon }) => (
              <li key={key} className="flex items-start gap-2.5">
                <Icon
                  aria-hidden
                  className="mt-0.5 h-[1.375rem] w-[1.375rem] shrink-0 text-[var(--color-acento)]"
                  strokeWidth={1.6}
                />
                <span className="min-w-0 text-[0.8125rem] leading-snug">
                  <span className="block font-medium text-[var(--color-neutro-claro)]">
                    {t(`features.${key}.title`)}
                  </span>
                  <span className="block text-[color-mix(in_srgb,var(--color-neutro-claro)_62%,transparent)]">
                    {t(`features.${key}.detail`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div
            className="hero-rise order-1 mt-7 flex flex-col gap-3 sm:order-none sm:mt-9 sm:flex-row sm:items-center"
            style={{ '--hero-delay': '0.36s' } as CSSProperties}
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
              <a href={`#${sectionIds.packages}`}>{t('ctaSecondary')}</a>
            </Button>
          </div>

          {/* Answers the three objections that stop a click — how long, what it
              commits me to, when I hear back — right where the click happens. */}
          <p
            className="hero-rise order-2 mt-4 inline-flex items-center gap-2 text-[0.8125rem] sm:order-none sm:mt-5 text-[color-mix(in_srgb,var(--color-neutro-claro)_62%,transparent)]"
            style={{ '--hero-delay': '0.42s' } as CSSProperties}
          >
            <CalendarCheck
              aria-hidden
              className="h-4 w-4 shrink-0 text-[var(--color-acento)]"
              strokeWidth={1.6}
            />
            {t('ctaMeta')}
          </p>

        </div>

        {/* The figure is not a grid child — see the absolutely positioned
            block after this container. The copy column still declares 7/12 so
            the headline keeps its measure and never runs under the diagram. */}
      </div>

      {/*
        Scroll affordance. The hero is `min-h-dvh`, so on a laptop it fills the
        viewport exactly and gives no edge-of-content cue that the page
        continues — this is that cue. A real link rather than a decorative
        chevron, so it works from the keyboard and states where it goes.
      */}
      <a
        href={`#${sectionIds.services}`}
        className="group absolute inset-x-0 bottom-6 mx-auto hidden w-fit flex-col items-center gap-1.5 text-[0.8125rem] text-[color-mix(in_srgb,var(--color-neutro-claro)_58%,transparent)] no-underline transition-colors duration-200 hover:text-[var(--color-neutro-claro)] md:flex"
      >
        <span className="inline-flex items-center gap-2">
          <MousePointerClick aria-hidden className="h-4 w-4" strokeWidth={1.6} />
          {t('scrollHint')}
        </span>
        <ChevronDown
          aria-hidden
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5"
          strokeWidth={1.6}
        />
      </a>
    </section>
  )
}
