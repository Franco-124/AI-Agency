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
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'

import { DemoBookingWidget } from '@/components/forms/DemoBookingWidget'
import { sectionIds } from '@/lib/site'

import heroBackdrop from '../../../public/images/hero-backdrop.webp'

/** The four capabilities in the icon row, in reading order. */
const heroFeatures: ReadonlyArray<{ key: string; Icon: LucideIcon }> = [
  { key: 'one', Icon: MessageCircle },
  { key: 'two', Icon: CalendarClock },
  { key: 'three', Icon: Users },
  { key: 'four', Icon: Globe },
]

/*
  One column of copy over a single full-bleed backdrop, at every size.

  The desktop hero used to flank the copy with two product visuals lifted from
  an approved comp. They are gone: they carried no information the sections
  below do not carry better, they forced the copy column to be derived from
  their width rather than from its own measure, and their `mix-blend-screen`
  was expensive enough that the whole section needed `content-visibility` to
  stay at 60fps once scrolled past. Removing them removed all three problems.

  What is left below `lg` is deliberately little: positioning line, headline,
  promise, CTA pair, reassurance. That is the whole phone hero. A small screen
  rewards making one claim and handing off, so the four capabilities are not
  there at all — they are services with their own illustrated cards two
  sections below, where each gets a paragraph rather than three words.

  The header keeps a CTA visible at every size, so this is not the visitor's
  only chance to act — which is what lets the phone hero stay this short.

  From `lg` up the same column centres itself and the capability row appears.
  The type is still measured off the original comp (1536 x 1024):

    headline      cap height 36px => ~50px type, line pitch 53.5px (1.07)
    headline box  635px wide      => breaks after "negocio" / "trabaje"
    subtitle      ~19px, wraps inside ~590px
    features      4 items, 36px gutters, 636px total
    CTAs          332px + 24px gap + 233px, 58px tall

  The headline cap is set in `em`, not px, so the three-line break survives the
  fluid type scale instead of only holding at one width — its first line needs
  11.8em, and the column width in `globals.css` clears that at every size.
*/

export function Hero() {
  const t = useTranslations('hero')

  return (
    <section
      id={sectionIds.hero}
      className="relative isolate overflow-hidden"
    >
      {/*
        The hero's field is now a single piece of artwork rather than a stack
        of hand-fitted gradients.

        The previous version painted the background with three layers of
        `radial-gradient` whose centres, radii and alphas were least-squares
        fitted to an approved comp, plus a masked 64px rule grid — roughly 60
        lines of CSS reproducing, approximately, an image that already existed.
        Shipping the image itself is both closer to the intent and cheaper:
        28KB of webp against four composited paint layers the compositor had
        to re-evaluate on every frame.

        `fill` with `object-cover` so it always covers the section at any
        aspect ratio, and `priority` because this is the LCP element on every
        viewport — it must not wait for the lazy-load observer.

        `object-position` is right-of-centre on phones: the artwork's light
        sweeps in from the top-right, and anchoring there keeps the bright arc
        on screen in portrait instead of cropping it away and leaving the
        headline on a flat dark field.
      */}
      <Image
        src={heroBackdrop}
        alt=""
        aria-hidden
        priority
        fill
        sizes="100vw"
        /*
          Desaturated and darkened in the browser rather than re-exported.

          The artwork is a saturated violet field — the whole frame is brand
          colour at high chroma, which is the single loudest "AI product"
          signal left on the page now that the surfaces underneath it are
          neutral. Left alone it simply contradicted them: a neutral document
          with a purple-lit cover.

          `saturate(0.28)` pulls the field nearly to graphite while keeping just
          enough hue that the light sweep still reads as the brand's rather than
          as grey; `brightness(0.62)` seats it behind the copy instead of
          competing with it, and the slight `contrast` bump keeps the sweep from
          going muddy once the other two have flattened it. A gentler grade was
          tried first (0.55/0.8) and was not enough — the source is saturated
          far enough that half measures still read as a purple wash. These are
          `filter` on a static image, applied once at paint, so they cost
          nothing per frame.

          This is a stopgap that happens to be the right stopgap: the real fix
          is a re-exported backdrop, and until there is one this keeps the hero
          in the same register as everything below it.
        */
        className="-z-30 object-cover object-[72%_center] [filter:saturate(0.28)_brightness(0.62)_contrast(1.08)] lg:object-center"
      />

      {/*
        Legibility scrim.

        The artwork is bright enough in its top-right quadrant that white type
        over it would drop below 4.5:1 on wide screens, where the copy column
        is centred and reaches into that light. This darkens the field just
        enough to hold contrast, and fades the bottom edge back to the site
        token so the seam with the next section stays invisible — the one job
        the old gradient stack did that the image cannot do for itself.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background: [
            'linear-gradient(to bottom, rgba(3, 5, 9, 0.55) 0%, rgba(3, 5, 9, 0.35) 55%, rgba(3, 5, 9, 0.8) 88%, var(--surface-base) 100%)',
          ].join(', '),
        }}
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
          The positioning line. Not painted on phones.

          This string is 55 characters, which on a 390px screen is two lines
          spent before the reader reaches the actual message — and the hero
          below `lg` sizes to its content, so those two lines pushed the whole
          block past the fold. Several treatments were tried first and all of
          them still cost the space: as loose 13px body text it read as a
          paragraph competing with the subtitle, and as a bordered pill it
          wrapped to *three* lines, which is not a pill but a paragraph with a
          border.

          `sr-only` rather than `hidden`: the string is the site's positioning
          and carries real SEO weight, so it must stay in the document and in
          the accessibility tree — `hidden` would drop it from both. It is only
          the visual cost that is removed. From `sm` up there is room, and
          `not-sr-only` restores it as the standard eyebrow.
        */}
        <p
          /*
            `lg:text-[0.8125rem]` nudges this up on desktop only. The shared
            `.type-eyebrow` token stays at 12px because every section heading
            on the page uses it and they should not all grow — but the hero's
            is the site's positioning line, carried alone above a 40px+
            headline, where 12px reads as fine print rather than as a label.
          */
          className="hero-rise sr-only sm:not-sr-only sm:flex sm:type-eyebrow sm:items-center sm:gap-2.5 sm:font-medium sm:text-[var(--text-muted)] lg:text-[0.8125rem] lg:tracking-[0.12em]"
          style={{ '--hero-delay': '0.05s' } as CSSProperties}
        >
          <span
            aria-hidden
            className="h-px w-7 shrink-0 bg-[var(--accent-hairline)]"
          />
          {t('eyebrow')}
        </p>

        {/*
          Assembled from parts rather than held as one string because two words
          carry the accent colour. Splitting it in the message file keeps the
          copy translatable without letting HTML into it.

          The phone cap is a hard `22rem` (352px), not a `ch` measure.

          Linear caps its mobile headline at 360px and Clerk at 280px, both as
          fixed px — and the reason is that `ch` is relative to the font size,
          so it drifts with the type scale and can resolve wider than the
          gutters leave. That is exactly how the subtitle here once ended up
          clipping the last word of every line. A fixed cap is the thing that
          actually forces the ragged three-line silhouette this headline wants.

          `text-balance` then distributes those breaks evenly rather than
          leaving an orphan — the same pairing Clerk, Attio, Ramp, Retool,
          Cursor and Vercel all ship.

          352px rather than Clerk's 280px because this headline is 64
          characters, not their 27: at 280px it broke to five lines. Sitting
          just inside Linear's 360px keeps it to three.
        */}
        <h1
          className="hero-rise type-display max-w-[22rem] text-balance sm:mt-6 sm:max-w-[26rem] lg:mt-8 lg:max-w-[13em] lg:text-balance"
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
            secondaryHref={`#${sectionIds.services}`}
          />
        </div>

        {/*
          Answers the two objections that actually stop the click — "what does
          it cost me" and "am I going to be sold to" — and names what the
          visitor walks away with either way.

          It replaced three metadata fragments split by middots ("30 min · Sin
          compromiso · Respuesta en el día"). Two of them did not survive
          scrutiny: the duration merely restated the button above it, and a
          same-day *reply* contradicts the CTA, which books a call rather than
          sending a question.

          `items-start` with the icon nudged onto the first line's optical
          centre, because this is now a sentence that wraps to two lines on a
          phone — centred alignment would have floated the glyph into the
          middle of the block.
        */}
        <p
          className="hero-rise mt-4 flex max-w-[32rem] items-start gap-2 text-[0.8125rem] leading-[1.55] text-[var(--text-muted)] sm:mt-5 lg:mt-6 lg:justify-center lg:text-center"
          style={{ '--hero-delay': '0.36s' } as CSSProperties}
        >
          <CalendarCheck
            aria-hidden
            className="mt-[0.2em] h-[0.9375rem] w-[0.9375rem] shrink-0 text-[var(--accent-text)]"
            strokeWidth={1.75}
          />
          <span className="min-w-0">{t('ctaMeta')}</span>
        </p>

        {/*
          Four capabilities — desktop only.

          They are gone from the phone layout entirely. Every intermediate
          treatment still cost the first screen more than it returned: as four
          grid cells stacking a title *and* a detail it was eight runs of 13px
          text under the CTA (440 characters on screen); reduced to a scrolling
          chip row it was four truncated labels that read as tags without
          telling the visitor anything the headline had not.

          Nothing is lost by dropping them. Each of these four is a service
          with its own illustrated card two sections below, where it gets a
          real paragraph instead of three words — so on a phone the hero makes
          one claim and hands off, which is what a small screen rewards.

          From `lg` up the width exists for the full
          icon-plus-title-plus-detail row, and it renders unchanged.
        */}
        <ul
          className="hero-rise hidden lg:mt-11 lg:flex lg:justify-center lg:gap-x-7"
          style={{ '--hero-delay': '0.42s' } as CSSProperties}
        >
          {heroFeatures.map(({ key, Icon }) => (
            <li key={key} className="flex min-w-0 items-start gap-2.5">
              {/*
                The icon is seated in a tinted tile rather than floating loose
                beside the text. Four bare strokes read as clip art; four
                seated glyphs read as a system — and the tile is what makes the
                accent legible at this size without pushing the stroke itself
                to full chroma.
              */}
              <span
                aria-hidden
                className="mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--accent-hairline)] bg-[var(--accent-soft)]"
              >
                <Icon
                  className="h-[0.875rem] w-[0.875rem] text-[var(--accent-text)]"
                  strokeWidth={1.9}
                />
              </span>

              {/*
                `whitespace-nowrap` keeps each label on its own two lines
                (title / detail). The copy is split into exactly those two
                parts, so a third line is always an accident of column width —
                at 1024 and 1280 it made the row 75px tall against 38px at
                1920, breaking its shared baseline. The row is measured to fit
                at every `lg` width, so nowrap cannot overflow.
              */}
              <span className="min-w-0 whitespace-nowrap text-left text-[0.8125rem] leading-[1.45]">
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
