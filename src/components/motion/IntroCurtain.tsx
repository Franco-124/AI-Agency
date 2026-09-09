'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * Beat timings, in ms from mount. Named rather than inlined because the CSS
 * delays and these have to stay in step, and because the exit is derived from
 * the last beat rather than guessed.
 */
const TIMINGS = {
  /*
   * One delay per rendered line. 160ms between the two halves of the first
   * sentence keeps them reading as one phrase being uncovered; the 260ms
   * before the resolution is the beat the pivot needs to land.
   */
  lineOne: 220,
  lineTwo: 400,
  /* A longer gap here: lines three and four are the second claim, and the
     pause is what keeps the two from reading as one four-line block. */
  lineThree: 780,
  lineFour: 960,
  brand: 1480,
  /*
     How long the finished frame is allowed to sit before it leaves.
     Deliberately the largest share of the extra second the sequence was
     lengthened by: stretching the stagger instead would slow the arrivals
     themselves, and a line that takes longer to appear reads as sluggish
     rather than as deliberate, while a longer hold reads as composure.
  */
  hold: 1400,
  /** The wipe itself. */
  exit: 760,
} as const

const AUTO_DISMISS = TIMINGS.brand + TIMINGS.hold

/** Once per session, not once per navigation. */
export const INTRO_SEEN_KEY = 'numi:intro-seen'

/**
 * Runs before React hydrates — injected as a blocking script in the layout's
 * `<head>`.
 *
 * The curtain is rendered by the server and is therefore up from the very
 * first paint. This decides, synchronously and before anything is painted,
 * whether this particular visit should keep it; if not it sets an attribute
 * that hides it in CSS, so it is never seen at all.
 *
 * The inversion matters. The first version mounted the curtain from an
 * effect, which meant it could not exist until React had hydrated — measured
 * at 660-814ms after the hero was already in the DOM, so every visitor saw
 * the page, then had it covered, then uncovered. Deciding to *remove*
 * something already present has no such window.
 *
 * Two query overrides ride along, purely as a reviewing affordance: `intro=1`
 * forces a replay and `intro=0` suppresses one. The once-per-session rule is
 * right for visitors but makes the intro nearly impossible to watch while
 * working on it, since every reload is the same session.
 */
export const INTRO_GATE_SCRIPT = `
(function () {
  try {
    var d = document.documentElement;
    var skip =
      window.location.hash ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Query overrides — see this constant's docstring. */
    var forced = window.location.search.indexOf('intro=1') !== -1;
    if (window.location.search.indexOf('intro=0') !== -1) skip = true;

    if (forced) {
      skip = false;
    } else if (!skip) {
      try {
        if (sessionStorage.getItem('${INTRO_SEEN_KEY}')) {
          skip = true;
        } else {
          sessionStorage.setItem('${INTRO_SEEN_KEY}', '1');
        }
      } catch (e) {
        /* Private browsing can refuse storage; playing it is the safe failure. */
      }
    }

    if (skip) d.setAttribute('data-intro', 'skip');
    else d.setAttribute('data-intro', 'play');
  } catch (e) {
    /* Never let the gate break the page — worst case the curtain plays. */
    document.documentElement.setAttribute('data-intro', 'skip');
  }
})();
`

/**
 * Whether this visit is actually showing the curtain.
 *
 * The verdict was reached before paint by `INTRO_GATE_SCRIPT` and recorded on
 * the root element; reading it back keeps one source of truth and means the
 * session flag is only ever written once.
 */
const isPlaying = () => document.documentElement.dataset.intro === 'play'

/**
 * One line of the statement, revealed by riding up out of a masked box.
 *
 * The text does not fade in, it *arrives* — translated up from below its own
 * clipping boundary, so the line appears to be uncovered rather than to
 * materialise. A fade says "an element became visible"; a masked rise says
 * "this was always here, and you are now being shown it".
 *
 * `overflow-hidden` on the wrapper plus `translateY(110%)` on the inner span
 * is all it takes, and both are compositor-only. 110% rather than 100% clears
 * descenders, which at 100% stay visible as a row of fragments below the mask.
 */
function Line({
  children,
  delay,
  className,
}: {
  children: React.ReactNode
  delay: number
  className?: string
}) {
  return (
    <span className="block overflow-hidden pb-[0.12em]">
      <span
        /*
         * `whitespace-nowrap` is what makes the mask honest. The wrapper is
         * one line tall by assumption and `translateY(110%)` only clears one
         * line, so a string that wrapped would leave its first line visible
         * above the mask from frame zero. The copy is stored pre-broken (see
         * `intro.line*` in the message files) and this stops any viewport
         * from re-breaking it.
         */
        className={cn('intro-line block whitespace-nowrap', className)}
        style={{ animationDelay: `${delay}ms` }}
      >
        {children}
      </span>
    </span>
  )
}

/**
 * The opening curtain.
 *
 * Rendered on the server, so it is painted with the first byte rather than
 * mounted after hydration — which is what removes the flash of hero the
 * previous version had. `data-intro="skip"` on the root element (written by
 * `INTRO_GATE_SCRIPT` before paint) hides it in CSS for any visit that should
 * not see it, so nothing here has to decide whether it is visible — the
 * effects below only ask whether to run their timers.
 *
 * The rest of its contract:
 *
 * - **Once per session**, not once per navigation — so client-side moves to
 *   /agendar and back never replay it.
 * - **Never under reduced motion, never on a deep link.** Arriving at
 *   `#paquetes` is a request for a section; covering it is hostile.
 * - **Skippable** by tap, key, wheel or touch.
 * - **Not a loading gate.** The page renders underneath from the first paint;
 *   this only sits on top of it.
 * - **`?intro=1` forces a replay** and `?intro=0` suppresses one — a
 *   reviewing affordance, since the once-per-session rule otherwise makes the
 *   intro impossible to re-watch without clearing storage by hand.
 */
export function IntroCurtain() {
  const t = useTranslations('intro')
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  /*
   * Locks the page while the curtain is up. Scrolling underneath an overlay
   * the visitor cannot see past is disorienting, and a stray scroll would
   * leave them somewhere they did not choose once it lifts.
   *
   * `gone` is in the dependency list, and that is load-bearing: when the
   * curtain finishes it returns `null` but the component stays mounted, so a
   * cleanup that only ran on unmount never ran at all and the page was left
   * permanently unscrollable. Re-running the effect on `gone` is what
   * releases the lock at the moment the curtain actually leaves.
   *
   * Both effects read the gate's verdict rather than tracking it in state.
   * The CSS already hides the curtain for a skipped visit, so there is
   * nothing to re-render — they only need to know whether to run at all.
   */
  useEffect(() => {
    if (!isPlaying() || gone) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [gone])

  /*
   * Starts the exit: the auto-advance timer, plus every obvious way to skip.
   *
   * Deliberately depends on nothing but `leaving`. An earlier version also
   * depended on it *and* scheduled the "now remove yourself" timer from
   * inside `dismiss` — so calling `dismiss` re-ran the effect, whose cleanup
   * cleared every timer including the one it had just set. The curtain then
   * sat in its leaving state forever, holding the scroll lock with it. The
   * two timers are separate concerns and now live in separate effects.
   */
  useEffect(() => {
    if (gone || leaving || !isPlaying()) return

    /*
     * Flips the gate the moment the exit starts, not when it finishes. The
     * hero underneath has been mounted and animating (entrance, particle
     * drift, the two `mix-blend-screen` visuals) since first paint — all of
     * it invisible under the curtain, all of it still costing frames the
     * curtain's own four-line stagger and drifting background need. `.hero-rise`
     * and `.soft-float`/`.particle` are gated on `data-intro='play'` in
     * globals.css for exactly this reason; this is what releases that gate.
     * Firing it at the start of the wipe rather than at `gone` costs nothing
     * visible — 760ms into a 7s float is imperceptible — and frees the frame
     * budget for the wipe itself, which is the animation most worth protecting.
     */
    const dismiss = () => {
      setLeaving(true)
      document.documentElement.dataset.intro = 'done'
    }

    const timer = window.setTimeout(dismiss, AUTO_DISMISS)
    window.addEventListener('pointerdown', dismiss, { once: true })
    window.addEventListener('keydown', dismiss, { once: true })
    window.addEventListener('wheel', dismiss, { once: true, passive: true })
    window.addEventListener('touchstart', dismiss, { once: true, passive: true })

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('keydown', dismiss)
      window.removeEventListener('wheel', dismiss)
      window.removeEventListener('touchstart', dismiss)
    }
  }, [gone, leaving])

  /*
   * Removes the curtain once the wipe has played out. Separate from the
   * effect above so that starting the exit cannot cancel the removal.
   */
  useEffect(() => {
    if (!leaving || gone) return

    const timer = window.setTimeout(() => setGone(true), TIMINGS.exit)
    return () => window.clearTimeout(timer)
  }, [leaving, gone])

  if (gone) return null

  return (
    <div
      /*
       * `aria-hidden` and no focusable children: the statement is decoration
       * for a screen reader — the page's own headings carry the message — and
       * `role="presentation"` would still announce the text inside.
       */
      aria-hidden
      className={cn(
        'intro-root fixed inset-0 z-[100] overflow-hidden bg-[var(--surface-base)]',
        leaving && 'intro-root-leaving',
      )}
      style={
        {
          '--intro-exit': `${TIMINGS.exit}ms`,
        } as React.CSSProperties
      }
    >
      {/*
        Ambient light, keyed to the hero's own field so the curtain reads as
        the page's first frame rather than a separate splash screen. It drifts
        very slowly, which keeps the finished frame from looking like a static
        image while it holds.
      */}
      <div
        className="intro-bloom absolute inset-0"
        style={{
          background: [
            'radial-gradient(58% 42% at 28% 34%, color-mix(in srgb, var(--color-acento) 22%, transparent) 0%, transparent 100%)',
            'radial-gradient(46% 34% at 84% 82%, color-mix(in srgb, var(--color-acento-deep) 26%, transparent) 0%, transparent 100%)',
          ].join(', '),
        }}
      />

      {/*
        The rule grid from the hero, at the same 64px pitch. It scales up a
        fraction over the sequence — a slow push the eye reads as depth
        without ever resolving as movement.
      */}
      <div
        className="intro-grid absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(to right, color-mix(in srgb, var(--color-neutro-claro) 4%, transparent) 1px, transparent 1px)',
            'linear-gradient(to bottom, color-mix(in srgb, var(--color-neutro-claro) 4%, transparent) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(62% 50% at 32% 42%, #000 0%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(62% 50% at 32% 42%, #000 0%, transparent 78%)',
        }}
      />

      {/* Grain, so the flat ground has the same tooth as the rest of the page. */}
      <div className="intro-grain absolute inset-0" />

      {/*
        Ranged left on the hero's own gutter, not centred. A centred lockup is
        the default every generated splash screen reaches for; matching the
        hero's left edge means the statement sits exactly where the headline is
        about to appear, so the reveal hands off to the page instead of cutting
        to it.
      */}
      <div className="relative flex h-full w-full items-center">
        <div className="mx-auto w-full max-w-[var(--measure-page)] px-5 sm:px-8">
          <div className="max-w-[34rem]">
            {/* Draws first, and is the only thing on screen for a beat — which
                is what makes the first line's arrival feel answered rather
                than abrupt. */}
            <span className="intro-rule block h-px w-16 origin-left bg-[linear-gradient(to_right,var(--color-acento),transparent)] sm:w-20" />

            <p className="mt-7 font-display text-[1.375rem] font-medium leading-[1.26] tracking-[-0.028em] text-[var(--text-primary)] sm:mt-9 sm:text-[2rem] lg:text-[2.375rem]">
              <Line delay={TIMINGS.lineOne}>{t('lineOne')}</Line>
              <Line delay={TIMINGS.lineTwo}>{t('lineTwo')}</Line>
              {/*
                The second claim carries the accent. It is the half the
                visitor is meant to leave with — the first says what stops
                costing them, this says what they gain — so colour marks
                where the statement turns.
              */}
              <Line
                delay={TIMINGS.lineThree}
                className="text-[var(--accent-text)]"
              >
                {t('lineThree')}
              </Line>
              <Line
                delay={TIMINGS.lineFour}
                className="text-[var(--accent-text)]"
              >
                {t('lineFour')}
              </Line>
            </p>

            {/* The signature, last and smallest — the statement earns the name
                rather than the name introducing the statement. */}
            <span className="mt-8 block sm:mt-10">
              <Line delay={TIMINGS.brand}>
                {/*
                  Set larger than the site's `type-eyebrow` (12px): this is
                  the brand signing the statement, and at eyebrow scale it
                  read as a caption rather than as a name. Tracking stays
                  wide, which is what keeps it reading as a mark.
                */}
                <span className="font-display text-[0.9375rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] sm:text-[1.0625rem]">
                  {t('brand')}
                </span>
              </Line>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
