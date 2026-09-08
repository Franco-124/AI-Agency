'use client'

import { useTranslations } from 'next-intl'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

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
  lineOne: 240,
  lineTwo: 400,
  lineThree: 660,
  brand: 1080,
  /** How long the finished frame is allowed to sit before it leaves. */
  hold: 700,
  /** The wipe itself. */
  exit: 760,
} as const

const AUTO_DISMISS = TIMINGS.brand + TIMINGS.hold

/** Once per session, not once per navigation. */
const SEEN_KEY = 'numi:intro-seen'

/**
 * Whether the curtain should play, decided once from browser state.
 *
 * Called from an effect, never during render. A `'use client'` component is
 * still prerendered on the server, so a `useState` initialiser that touches
 * `window` throws there — which is exactly how this was first written, and it
 * 500'd the route.
 */
function shouldPlay(): boolean {
  // A deep link is a request for a specific section — never cover it.
  if (window.location.hash) return false

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /*
     * Private browsing can refuse storage. Playing the intro is the safe
     * failure — it is brief and skippable — but it must not throw.
     */
  }

  return true
}

const subscribeNoop = () => () => {}

/**
 * Reports whether this client has mounted yet.
 *
 * `useSyncExternalStore` is the sanctioned way to read something outside
 * React's render — here, "are we in a browser". Its server snapshot is
 * `false` and its client snapshot `true`, so the first paint matches the
 * server exactly and the second may look at `window`.
 */
function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
}

/**
 * The gate. Renders nothing on the server and nothing on a visit that should
 * not see the curtain, and otherwise mounts `Curtain` — which therefore only
 * ever exists while it is actually playing.
 */
export function IntroCurtain() {
  const hasMounted = useHasMounted()
  const play = useMemo(() => hasMounted && shouldPlay(), [hasMounted])

  if (!play) return null

  return <Curtain />
}

/**
 * One line of the statement, revealed by riding up out of a masked box.
 *
 * This is the technique that separates a considered opening from a generic
 * one, and it is worth understanding why: the text does not fade in, it
 * *arrives* — translated up from below its own clipping boundary, so the line
 * appears to be uncovered rather than to materialise. A fade says "an element
 * became visible"; a masked rise says "this was always here, and you are now
 * being shown it".
 *
 * `overflow-hidden` on the wrapper plus `translateY(110%)` on the inner span
 * is all it takes, and both properties are compositor-only. The 110% (rather
 * than 100%) clears descenders, which at 100% stay visible as a row of
 * fragments below the mask.
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
         * one line tall by assumption, and `translateY(110%)` only clears one
         * line — so a string that wrapped would leave its first line visible
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

function Curtain() {
  const t = useTranslations('intro')
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const timersRef = useRef<number[]>([])

  /*
   * Locks the page while the curtain is up. Scrolling underneath an overlay
   * the visitor cannot see past is disorienting, and a stray scroll would
   * leave them somewhere they did not choose once it lifts.
   */
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    if (leaving) return

    const dismiss = () => {
      setLeaving(true)
      timersRef.current.push(window.setTimeout(() => setGone(true), TIMINGS.exit))
    }

    // Auto-advance, plus every obvious way to say "skip".
    timersRef.current.push(window.setTimeout(dismiss, AUTO_DISMISS))
    window.addEventListener('pointerdown', dismiss, { once: true })
    window.addEventListener('keydown', dismiss, { once: true })
    window.addEventListener('wheel', dismiss, { once: true, passive: true })
    window.addEventListener('touchstart', dismiss, { once: true, passive: true })

    return () => {
      timersRef.current.forEach(window.clearTimeout)
      timersRef.current = []
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('keydown', dismiss)
      window.removeEventListener('wheel', dismiss)
      window.removeEventListener('touchstart', dismiss)
    }
  }, [leaving])

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
        very slowly during the hold, which is what keeps the finished frame
        from looking like a static image while it waits.
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
        fraction over the whole sequence — a slow push that the eye reads as
        depth without ever resolving as movement.
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
        Ranged left and set on the same 5/8-unit gutter as the hero copy, not
        centred. A centred lockup is the default every generated splash screen
        reaches for; matching the hero's own left edge means the statement sits
        exactly where the headline is about to appear, so the reveal hands off
        to the page instead of cutting to it.
      */}
      <div className="relative flex h-full w-full items-center">
        <div className="mx-auto w-full max-w-[var(--measure-page)] px-5 sm:px-8">
          <div className="max-w-[34rem]">
            {/* The accent rule draws out first — it is the only thing on
                screen for a beat, which is what makes the first line's
                arrival feel answered rather than abrupt. */}
            <span className="intro-rule block h-px w-16 origin-left bg-[linear-gradient(to_right,var(--color-acento),transparent)] sm:w-20" />

            <p className="mt-7 font-display text-[1.375rem] font-medium leading-[1.26] tracking-[-0.028em] text-[var(--text-primary)] sm:mt-9 sm:text-[2rem] lg:text-[2.375rem]">
              <Line delay={TIMINGS.lineOne}>{t('lineOne')}</Line>
              <Line delay={TIMINGS.lineTwo}>{t('lineTwo')}</Line>
              {/*
                The resolution carries the accent. It is the half of the
                statement the visitor is meant to leave with, and colouring it
                is what marks the pivot the line turns on.
              */}
              <Line
                delay={TIMINGS.lineThree}
                className="text-[var(--accent-text)]"
              >
                {t('lineThree')}
              </Line>
            </p>

            {/* The signature, last and smallest — the statement earns the
                name rather than the name introducing the statement. */}
            <span className="mt-8 block sm:mt-10">
              <Line delay={TIMINGS.brand}>
                <span className="type-eyebrow text-[var(--text-muted)]">
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
