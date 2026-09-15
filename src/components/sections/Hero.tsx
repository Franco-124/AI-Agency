import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'

import { DemoBookingWidget } from '@/components/forms/DemoBookingWidget'
import { sectionIds } from '@/lib/site'

import { HeroMarquee } from './HeroMarquee'

/*
  A single centred column — headline, promise, the CTA pair — closed by a
  full-bleed strip of phrases where a logo wall would go.

  This replaced a hero built the other way round: two flanking product visuals,
  a particle field, a masked rule grid and a four-item capability row around
  the copy. Each was defensible alone, but together they gave the first screen
  four things competing for the same glance and the headline was only one of
  them. Everything cut still exists further down the page — the four
  capabilities are services with their own illustrated cards, where each gets a
  paragraph instead of three words.

  The headline is set in the serif display face against everything else in the
  sans, which is the whole typographic idea of the page: the serif is the voice
  making the argument, the sans is the interface around it.
*/
export function Hero() {
  const t = useTranslations('hero')
  const marqueeItems = t.raw('marquee.items') as ReadonlyArray<string>

  return (
    <section
      id={sectionIds.hero}
      className="hero-frame relative isolate flex flex-col overflow-hidden bg-[var(--hero-bg)]"
    >
      {/*
        The only visual element behind the copy: one wide, soft violet bloom
        centred on the headline.

        It is a `radial-gradient` rather than a blurred box because a gradient
        is painted once by the rasteriser, while `filter: blur()` at this size
        forces an offscreen buffer the compositor re-reads — for a shape whose
        entire purpose is to have no discernible edge. The stop positions do
        the diffusing, and the alpha is keyed to the accent token so the
        palette stays auditable from `globals.css` alone.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(42% 38% at 50% 34%, color-mix(in srgb, var(--color-acento) 30%, transparent) 0%, color-mix(in srgb, var(--color-acento) 11%, transparent) 45%, transparent 72%)',
        }}
      />

      {/*
        Copy column. Centred at every size — the phone layout differs only in
        type scale and in the CTA pair stacking, not in alignment, so the
        hierarchy survives the breakpoint.

        `62rem` rather than the 56.25rem of the reference mockup, because the
        headline's own `em` cap resolves to about 60.75rem once the type
        reaches the top of its ramp. A narrower column here would silently
        become the real constraint at large widths and squeeze the headline
        back into ragged lines — the exact failure the `em` cap exists to
        prevent. The column stays wider than the headline so that the headline
        is always the thing deciding its own measure; each child below caps
        itself.
      */}
      <div className="relative z-10 mx-auto flex w-full max-w-[62rem] flex-1 flex-col items-center justify-center px-6 pb-16 pt-[calc(var(--header-height)+3.5rem)] text-center sm:pb-20 sm:pt-[calc(var(--header-height)+5rem)] lg:pb-24 lg:pt-[calc(var(--header-height)+6rem)]">
        {/*
          One flowing sentence, broken by the measure rather than by an
          author-chosen line break — a hard break can only be right at one
          width, and this headline is read at every width between 320px and
          1920px.

          The cap is in `em`, not `rem` or `px`, and that is the whole reason
          the lines come out even. `em` resolves against this element's own
          font size, which is fluid (`clamp(2.125rem … 4.5rem)`), so the
          measure holds the same ~25 characters per line at every size. The
          previous fixed `45rem` could only be correct at one point on that
          ramp: at the 4.5rem end it left about 20 characters per line and
          broke the sentence into four ragged lines, and at the small end it
          ran to 42 and gave two long ones with an orphan under them.

          `text-balance` then evens out whatever breaks remain. It only
          redistributes within the width it is given — it cannot rescue a
          measure that is wrong for the type size, which is why the cap has to
          be right first.
        */}
        <h1
          className="hero-rise type-display max-w-[13.5em] text-balance text-[var(--text-primary)]"
          style={{ '--hero-delay': '0.05s' } as CSSProperties}
        >
          {t('title')}
        </h1>

        <p
          className="hero-rise mt-6 max-w-[35rem] text-balance text-[1rem] leading-[1.6] text-[var(--text-secondary)] sm:text-[1.125rem]"
          style={{ '--hero-delay': '0.14s' } as CSSProperties}
        >
          {t('subtitle')}
        </p>

        {/*
          Stacks below `sm` rather than wrapping: two full-width buttons on a
          phone are a clearer tap-target pair than two half-width ones that may
          or may not fit on one row depending on the translation's length.
        */}
        <div
          className="hero-rise mt-9 flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center sm:justify-center lg:mt-10"
          style={{ '--hero-delay': '0.22s' } as CSSProperties}
        >
          <DemoBookingWidget
            ctaLabel={t('cta')}
            secondaryLabel={t('ctaSecondary')}
            secondaryHref={`#${sectionIds.services}`}
          />
        </div>
      </div>

      {/*
        The strip runs the full width of the section and sits in its flow at
        the bottom edge — not absolutely positioned — so it can never overlap
        the copy on a short window; the section simply grows instead.

        Its own hairline separates it from the copy above, which is what makes
        it read as a band the page passes through rather than as a caption
        belonging to the CTAs.
      */}
      <div
        className="hero-rise relative z-10 w-full border-t border-[var(--surface-border-subtle)]"
        style={{ '--hero-delay': '0.3s' } as CSSProperties}
      >
        <HeroMarquee label={t('marquee.ariaLabel')} items={marqueeItems} />
      </div>

      {/*
        Closes the hero with a hairline that fades at both ends, the same
        treatment every section separator uses — so the seam between the hero
        and the page below reads as part of one system.
      */}
      <span
        aria-hidden
        className="edge-rule pointer-events-none absolute inset-x-0 bottom-0 z-10"
      />
    </section>
  )
}
