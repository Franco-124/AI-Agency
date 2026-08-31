import {
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  Globe,
  MessageCircle,
  MousePointerClick,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'

import { DemoBookingWidget } from '@/components/forms/DemoBookingWidget'
import { HeroMotion } from '@/components/motion/HeroMotion'
import { sectionIds } from '@/lib/site'

import agentStepsVisual from '../../../public/images/hero-agent-steps.webp'
import outcomeCardsVisual from '../../../public/images/hero-outcome-cards.webp'
import { HeroSideVisual } from './HeroSideVisual'

/** The four capabilities in the icon row, in reading order. */
const heroFeatures: ReadonlyArray<{ key: string; Icon: LucideIcon }> = [
  { key: 'one', Icon: MessageCircle },
  { key: 'two', Icon: CalendarClock },
  { key: 'three', Icon: Users },
  { key: 'four', Icon: Globe },
]

/*
  Two layouts in one tree.

  Below `lg` this is the original hero, unchanged: copy ranged left, the CTA
  pulled above the feature row on phones, no side visuals.

  From `lg` up it is the approved comp — copy centred between two flanking
  product visuals. Every number in that half is measured off the comp
  (1536 x 1024) rather than invented:

    headline      cap height 36px => ~50px type, line pitch 53.5px (1.07)
    headline box  635px wide      => breaks after "negocio" / "trabaje"
    subtitle      ~19px, wraps inside ~590px
    features      4 items, 36px gutters, 636px total
    CTAs          332px + 24px gap + 233px, 58px tall
    left visual   x 51-377,    y 197-687   (327 x 491)
    right visual  x 1114-1467, y 192-819   (354 x 628)

  The headline cap is set in `em`, not px, so the three-line break survives the
  fluid type scale instead of only holding at one width — its first line needs
  11.8em, and the column width in `globals.css` is derived to always clear that.
  Desktop geometry (visual width and inset) lives there too, as custom
  properties on the section, because the column and the visuals both read it.
*/

export function Hero() {
  const t = useTranslations('hero')

  return (
    <section
      id={sectionIds.hero}
      className="hero-frame relative isolate overflow-hidden"
    >
      {/*
        Deep base, sampled off the comp's own field. The bottom 16% fades back
        to the site token so the seam with the next section stays invisible.

        Nothing else dims the lower edge: an overlay fade was tried here and
        removed, because the comp keeps its violet live all the way to the
        bottom-right corner and the fade flattened exactly that.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-30"
        style={{
          background:
            'linear-gradient(to bottom, #03040a 0%, #03040a 84%, var(--color-neutro-oscuro) 100%)',
        }}
      />

      {/*
        Ambient light: one bloom low on the right plus a very wide, very faint
        lift across the middle. Centres, radii and alphas are a least-squares
        fit to the comp's background pixels (RMSE 4.2/255), not eyeballed — an
        earlier hand-tuned pair leaked violet into the top corners, which the
        comp keeps flat black.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background: [
            'radial-gradient(28% 48% at 90% 74%, rgba(109,40,217,0.44) 0%, transparent 100%)',
            'radial-gradient(72% 34% at 50% 104%, rgba(109,40,217,0.10) 0%, transparent 100%)',
            'radial-gradient(95% 44% at 49.5% 50%, rgba(109,40,217,0.07) 0%, transparent 100%)',
          ].join(', '),
        }}
      />

      {/* Slow particle field. Nothing in it moves fast enough to pull focus. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <HeroMotion />
      </div>

      {/*
        Side visuals, desktop only. Absolute so they never enter the centre
        column's flow and never affect where the copy lands, and centred on the
        section's midline the way the comp centres them — the left one rides
        3rem higher, which is the offset measured off the comp.
      */}
      <HeroSideVisual
        src={agentStepsVisual}
        className="absolute left-[var(--hero-visual-inset)] top-1/2 z-0 hidden w-[var(--hero-visual-w)] -translate-y-[calc(50%+3rem)] lg:block"
      />
      <HeroSideVisual
        src={outcomeCardsVisual}
        floatDelay="-3.5s"
        className="absolute right-[var(--hero-visual-inset)] top-1/2 z-0 hidden w-[var(--hero-visual-w)] -translate-y-1/2 lg:block"
      />

      {/*
        Copy column. Top-aligned and ranged left on phones, exactly as before;
        optically centred between the visuals from `lg` up.

        Cross-axis alignment is left at the default `stretch` below `lg` on
        purpose: `items-start` here would shrink-to-fit every child to its
        max-content width, so the headline and eyebrow would overflow the
        viewport instead of wrapping.
      */}
      <div className="relative z-10 mx-auto hero-shell hero-copy flex w-full flex-col justify-start px-5 pb-16 pt-[calc(var(--header-height)+3rem)] sm:px-8 lg:items-center lg:justify-center lg:pb-[calc(var(--header-height)+1.5rem)] lg:pt-[calc(var(--header-height)+1.5rem)] lg:text-center">
        <p
          className="hero-rise type-eyebrow inline-flex items-center gap-2.5"
          style={{ '--hero-delay': '0.05s' } as CSSProperties}
        >
          {/* The rule anchors a left-ranged eyebrow; centred, it would hang off it. */}
          <span
            aria-hidden
            className="rule-grow h-px w-8 bg-[var(--surface-border-strong)] lg:hidden"
            style={{ '--hero-delay': '0.25s' } as CSSProperties}
          />
          {t('eyebrow')}
        </p>

        {/*
          Assembled from parts rather than held as one string because two words
          carry the accent colour. Splitting it in the message file keeps the
          copy translatable without letting HTML into it.
        */}
        <h1
          className="hero-rise type-display mt-5 max-w-full text-[clamp(2rem,1.4rem+3vw,3.6rem)] sm:mt-7 sm:max-w-[19ch] lg:mt-8 lg:max-w-[12.4em] lg:text-[clamp(2.8rem,3.7vw,4.5rem)] lg:leading-[1.02] lg:tracking-[-0.03em]"
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
          className="hero-rise type-lead mt-5 max-w-[52ch] sm:mt-7 lg:mt-7 lg:max-w-[36rem] lg:text-[clamp(1rem,0.88rem+0.3vw,1.125rem)] lg:leading-[1.6]"
          style={{ '--hero-delay': '0.22s' } as CSSProperties}
        >
          {t('subtitle')}
        </p>

        {/*
          Four capabilities as icon-plus-label, deliberately not cards: the hero
          already carries two card-heavy visuals and a third set would read as a
          dashboard.
        */}
        <ul
          className="hero-rise order-3 mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:order-none sm:flex sm:flex-wrap sm:gap-x-8 lg:mt-11 lg:justify-center lg:gap-x-7"
          style={{ '--hero-delay': '0.28s' } as CSSProperties}
        >
          {heroFeatures.map(({ key, Icon }) => (
            <li key={key} className="flex items-start gap-2.5 lg:items-center">
              <Icon
                aria-hidden
                className="mt-0.5 h-[1.375rem] w-[1.375rem] shrink-0 text-[var(--color-acento)] lg:mt-0"
                strokeWidth={1.6}
              />
              <span className="min-w-0 text-left text-[0.8125rem] leading-snug">
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
          className="hero-rise order-1 mt-7 flex flex-col gap-3 sm:order-none sm:mt-9 sm:flex-row sm:items-center lg:mt-12 lg:gap-6"
          style={{ '--hero-delay': '0.36s' } as CSSProperties}
        >
          <DemoBookingWidget
            ctaLabel={t('cta')}
            secondaryLabel={t('ctaSecondary')}
            secondaryHref={`#${sectionIds.packages}`}
          />
        </div>

        {/* Answers the three objections that stop a click */}
        <p
          className="hero-rise order-2 mt-4 inline-flex items-center gap-2 text-[0.8125rem] text-[color-mix(in_srgb,var(--color-neutro-claro)_62%,transparent)] sm:order-none sm:mt-5 lg:mt-6"
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

      {/*
        Scroll affordance. The hero occupies the whole first screen, so nothing
        of the next section shows through to imply one — this is the only cue
        that the page continues, which is why it runs at every size.
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
