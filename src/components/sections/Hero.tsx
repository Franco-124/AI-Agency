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
            'linear-gradient(to bottom, #04030a 0%, #04030a 84%, var(--surface-base) 100%)',
        }}
      />

      {/*
        Ambient light. Centres, radii and alphas were originally a
        least-squares fit to the approved comp's background pixels, and the
        desktop pair below is unchanged from that fit.

        What is new is that the field is now direction-aware on phones. The
        desktop bloom sits low-right, behind the right-hand product visual —
        but that visual is hidden below `lg`, so on a phone the brightest part
        of the screen was an empty corner while the headline sat on flat black.
        The phone field instead places a single soft bloom up and behind the
        headline, so the copy is lit by it and the type has something to sit
        against. Both are keyed to the accent token rather than a hardcoded
        violet, so the palette stays auditable from one place.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 lg:hidden"
        style={{
          background: [
            /*
              Tight and low-alpha on purpose. An earlier pass ran this at 26%
              over 90% of the width, which tinted the entire phone screen
              violet — the headline then sat on a coloured field rather than
              being lit by one, and the section read as a purple block instead
              of as a dark page with light in it. 14% over a 62%-wide ellipse
              lands the falloff inside the headline's own block.
            */
            'radial-gradient(62% 34% at 18% 14%, color-mix(in srgb, var(--color-acento) 14%, transparent) 0%, transparent 100%)',
            'radial-gradient(58% 30% at 96% 82%, color-mix(in srgb, var(--color-acento-deep) 20%, transparent) 0%, transparent 100%)',
          ].join(', '),
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 hidden lg:block"
        style={{
          background: [
            'radial-gradient(28% 48% at 90% 74%, color-mix(in srgb, var(--color-acento-deep) 52%, transparent) 0%, transparent 100%)',
            'radial-gradient(72% 34% at 50% 104%, color-mix(in srgb, var(--color-acento-deep) 14%, transparent) 0%, transparent 100%)',
            'radial-gradient(95% 44% at 49.5% 50%, color-mix(in srgb, var(--color-acento) 8%, transparent) 0%, transparent 100%)',
          ].join(', '),
        }}
      />

      {/*
        Grid field. A very faint 64px rule grid, masked to a soft ellipse so it
        exists only where the copy sits and never reaches an edge to reveal
        itself as a tiled pattern.

        This is the piece that most changes how the hero reads: it gives the
        headline a plane to sit on. Deep-space gradients alone have no
        measurable surface, which is why an unstructured dark hero looks
        unfinished no matter how well the type is set.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.55]"
        style={{
          backgroundImage: [
            'linear-gradient(to right, color-mix(in srgb, var(--color-neutro-claro) 4%, transparent) 1px, transparent 1px)',
            'linear-gradient(to bottom, color-mix(in srgb, var(--color-neutro-claro) 4%, transparent) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(80% 62% at 30% 34%, #000 0%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(80% 62% at 30% 34%, #000 0%, transparent 78%)',
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
      {/*
        Phone reading order is now the DOM order — the `order-1/2/3` utilities
        that pulled the CTA above the feature list are gone.

        They were solving a real problem (the CTA sat too far down) but doing it
        by making the visual sequence disagree with the DOM: keyboard and
        screen-reader users met the four capabilities *after* the button that
        follows them, and the reason for the mismatch was invisible in the
        markup. The order is instead fixed at the source — the feature list is
        now a compact two-line strip on phones rather than a four-row grid, so
        the CTA is above the fold on its own merits.
      */}
      <div className="relative z-10 mx-auto hero-shell hero-copy flex w-full flex-col justify-start px-5 pb-20 pt-[calc(var(--header-height)+2.25rem)] sm:px-8 sm:pb-24 lg:items-center lg:justify-center lg:pb-[calc(var(--header-height)+1.5rem)] lg:pt-[calc(var(--header-height)+1.5rem)] lg:text-center">
        {/*
          The eyebrow is the site's positioning line and it is long ("Agencia de
          automatización con IA para pymes en Colombia"). At the eyebrow's 11px
          uppercase treatment that wraps to three cramped lines on a phone, so
          below `sm` it renders as sentence-case body text with a leading accent
          dot instead — same string, same role, actually readable.
        */}
        <p
          className="hero-rise inline-flex max-w-[30ch] items-baseline gap-2.5 text-[0.8125rem] font-medium leading-relaxed text-[var(--text-muted)] sm:type-eyebrow sm:max-w-none sm:items-center"
          style={{ '--hero-delay': '0.05s' } as CSSProperties}
        >
          <span
            aria-hidden
            className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-acento)] sm:mt-0 sm:h-px sm:w-7 sm:rounded-none sm:bg-[var(--accent-hairline)]"
          />
          {t('eyebrow')}
        </p>

        {/*
          Assembled from parts rather than held as one string because two words
          carry the accent colour. Splitting it in the message file keeps the
          copy translatable without letting HTML into it.

          The phone cap is `min(17ch, 100%)`, not a bare `17ch`. A `ch` measure
          is relative to the font size, so at the headline's scale 17ch can
          resolve wider than the gutters leave — which is exactly how the
          subtitle below ended up clipping its last word per line. `min()` lets
          the measure apply where there is room for it and yields to the
          container where there is not. 17ch is the value that breaks the
          33-character Spanish headline after roughly three words per line,
          keeping it to three lines at a size that does not shout; the scale
          itself caps at 2.125rem below 48rem — see `.type-display`.
        */}
        <h1
          className="hero-rise type-display mt-4 max-w-[min(17ch,100%)] text-balance sm:mt-6 sm:max-w-[min(20ch,100%)] lg:mt-8 lg:max-w-[13em] lg:text-balance"
          style={{ '--hero-delay': '0.12s' } as CSSProperties}
        >
          {t('title.lead')}{' '}
          <span className="text-[var(--accent-text)]">
            {t('title.highlightOne')}
          </span>
          {t('title.middle')}{' '}
          <span className="text-[var(--accent-text)]">
            {t('title.highlightTwo')}
          </span>
          {t('title.tail')}
        </h1>

        {/*
          `max-w-full` below `sm`, not a `ch` measure.

          A `ch` cap is the right tool for a *reading* measure on a wide
          column, but on a 390px phone `38ch` resolves wider than the 350px
          the gutters leave — so the paragraph overflowed the viewport and the
          last word of each line was clipped. The phone column is already the
          measure; from `sm` up, where there is more width than a comfortable
          line, the `ch` cap takes over and does its actual job.
        */}
        <p
          className="hero-rise type-lead mt-4 max-w-full sm:mt-6 sm:max-w-[46ch] lg:mt-7 lg:max-w-[34rem]"
          style={{ '--hero-delay': '0.22s' } as CSSProperties}
        >
          {t('subtitle')}
        </p>

        {/*
          CTA pair. Directly under the subtitle at every size now: on a phone
          the headline, the promise and the action are the whole first screen,
          and everything else is what the visitor finds by scrolling.
        */}
        <div
          className="hero-rise mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center lg:mt-10 lg:gap-4"
          style={{ '--hero-delay': '0.3s' } as CSSProperties}
        >
          <DemoBookingWidget
            ctaLabel={t('cta')}
            secondaryLabel={t('ctaSecondary')}
            secondaryHref={`#${sectionIds.packages}`}
          />
        </div>

        {/* Answers the three objections that stop a click */}
        <p
          className="hero-rise mt-4 inline-flex items-center gap-2 text-[0.8125rem] text-[var(--text-muted)] sm:mt-5 lg:mt-6"
          style={{ '--hero-delay': '0.36s' } as CSSProperties}
        >
          <CalendarCheck
            aria-hidden
            className="h-[0.9375rem] w-[0.9375rem] shrink-0 text-[var(--accent-text)]"
            strokeWidth={1.75}
          />
          {t('ctaMeta')}
        </p>

        {/*
          Four capabilities, below the CTA at every size.

          On phones this is a two-column strip of icon-plus-label with the
          detail line dropped to a second line only where it fits — the old
          version stacked a title *and* a detail in each of four grid cells,
          which is eight lines of 13px text competing with the headline for the
          same screen. The list is separated from the CTA block by a hairline
          rather than by whitespace alone, so it reads as supporting detail
          rather than as a second, weaker set of claims.
        */}
        {/*
          Desktop is a centred flex row, not a four-column grid.

          The grid forced four equal tracks out of the copy column's width,
          which is narrower than four of these labels need — so "Agenda
          automática de citas" broke across three lines while its neighbours
          sat on one, and the row lost its baseline. A flex row lets each item
          take the width its own label needs and wrap as a unit if it must.
        */}
        <ul
          className="hero-rise mt-9 grid w-full max-w-[34rem] grid-cols-2 gap-x-5 gap-y-4 border-t border-[var(--surface-border-subtle)] pt-7 sm:mt-10 sm:gap-x-8 lg:mt-11 lg:flex lg:max-w-none lg:flex-nowrap lg:justify-center lg:gap-x-7 lg:border-t-0 lg:pt-0"
          style={{ '--hero-delay': '0.42s' } as CSSProperties}
        >
          {heroFeatures.map(({ key, Icon }) => (
            <li key={key} className="flex min-w-0 items-start gap-2.5">
              {/*
                The icon sits in its own tinted tile rather than floating loose
                beside the text. Four bare 22px strokes read as clip art; four
                seated glyphs read as a system — and the tile is what makes the
                accent legible at this size without turning the stroke itself
                up to full chroma.
              */}
              <span
                aria-hidden
                className="mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.4375rem] border border-[var(--accent-hairline)] bg-[var(--accent-soft)]"
              >
                <Icon
                  className="h-[0.875rem] w-[0.875rem] text-[var(--accent-text)]"
                  strokeWidth={1.9}
                />
              </span>
              {/*
                `lg:whitespace-nowrap` keeps each label on its own two lines
                (title / detail) rather than letting either wrap again. The
                copy is split into exactly those two parts in the message file,
                so a third line is always an accident of column width — at
                1024 and 1280 it made the row 75px tall against 38px at 1920,
                which is what broke the row's shared baseline. The row is
                measured to fit at every `lg` width, so nowrap cannot overflow.
              */}
              <span className="min-w-0 text-left text-[0.8125rem] leading-[1.45] lg:whitespace-nowrap">
                <span className="block font-medium text-[var(--text-primary)]">
                  {t(`features.${key}.title`)}
                </span>
                <span className="block text-[var(--text-muted)]">
                  {t(`features.${key}.detail`)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/*
        Scroll affordance. The hero occupies the whole first screen, so nothing
        of the next section shows through to imply one — this is the only cue
        that the page continues, which is why it runs at every size.
      */}
      <a
        href={`#${sectionIds.services}`}
        className="group absolute inset-x-0 bottom-7 mx-auto hidden w-fit flex-col items-center gap-2 text-[0.75rem] font-medium tracking-[0.02em] text-[var(--text-muted)] no-underline transition-colors duration-200 hover:text-[var(--text-primary)] lg:flex"
      >
        <span className="inline-flex items-center gap-2">
          <MousePointerClick
            aria-hidden
            className="h-[0.875rem] w-[0.875rem]"
            strokeWidth={1.75}
          />
          {t('scrollHint')}
        </span>
        {/*
          The chevron sits in a ring rather than floating on its own, which is
          what makes it read as a control the visitor may press instead of a
          decorative arrow — and gives the hover a shape to fill.
        */}
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--surface-border)] transition-colors duration-200 group-hover:border-[var(--accent-hairline)] group-hover:bg-[var(--accent-soft)]">
          <ChevronDown
            aria-hidden
            className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-emphasis)] group-hover:translate-y-0.5"
            strokeWidth={1.75}
          />
        </span>
      </a>

      {/*
        Closes the hero with a hairline that fades at both ends, the same
        treatment every section separator now uses — so the seam between the
        hero and the page below reads as part of one system rather than as the
        point where the "designed" part stops.
      */}
      <span
        aria-hidden
        className="edge-rule pointer-events-none absolute inset-x-0 bottom-0 z-10"
      />
    </section>
  )
}
