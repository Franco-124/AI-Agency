'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

/** How long the curtain holds before it starts leaving, in ms. */
const HOLD = 1500
/** The exit itself. Kept short — an exit the visitor waits through is a toll. */
const EXIT = 620
/** Once per session, not once per navigation. */
const SEEN_KEY = 'numi:intro-seen'

/**
 * The opening curtain: the wordmark, a line of positioning copy, and a rule
 * that draws itself across before the whole thing lifts to reveal the page.
 *
 * Anything that delays a landing page has to justify itself, so this is built
 * around not costing the visitor anything:
 *
 * - **Once per session.** `sessionStorage` gates it, so it plays on arrival
 *   and never again while the visitor is browsing — including on every
 *   client-side navigation to /agendar and back, which is where a
 *   play-on-mount intro becomes genuinely irritating.
 * - **Never for a returning visitor mid-session, never under reduced motion,
 *   and never for a deep link.** Arriving at `#paquetes` means the visitor
 *   asked for a specific section; covering it to play an animation is
 *   hostile.
 * - **Skippable.** A tap, a key, or a scroll dismisses it immediately.
 * - **Not a loading gate.** The page renders underneath from the first paint;
 *   this only sits on top of it. So the LCP element is painting while the
 *   curtain is up, and dismissing it early reveals a page that is already
 *   there rather than starting a load.
 * - **Absent from the server-rendered HTML.** The component itself *is*
 *   prerendered — `'use client'` marks the hydration boundary, it does not
 *   opt out of SSR — but it starts in a phase that renders `null` and only
 *   decides to play from an effect. So the markup a crawler or an answer
 *   engine receives is the page, never the curtain.
 *
 * The whole sequence is ~2.1s and it uses the site's own tokens — the accent
 * gradient on the wordmark, the display face, the same easing curve as every
 * other entrance on the page.
 */
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

/**
 * Reports whether this client has mounted yet.
 *
 * `useSyncExternalStore` is the sanctioned way to read something that exists
 * outside React's render — here, "are we in a browser". Its server snapshot
 * is `false` and its client snapshot is `true`, so the first paint matches the
 * server exactly (no curtain, no hydration mismatch) and the second knows it
 * may look at `window`.
 *
 * The alternative — `setState` inside a mount effect — is what
 * `react-hooks/set-state-in-effect` exists to catch, and it is right to: it
 * renders a throwaway frame on every visit purely to ask a question the
 * environment could have answered.
 */
const subscribeNoop = () => () => {}

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
 * ever exists when it is actually playing.
 *
 * Splitting it this way is what keeps both lint rules satisfied and the code
 * honest: the decision needs `window`, so it cannot happen during the server
 * render; making it here, at the boundary, means `Curtain` never has to model
 * "maybe I should not exist".
 */
export function IntroCurtain() {
  const hasMounted = useHasMounted()

  /*
   * `useMemo` rather than a ref written during render (which React forbids)
   * or `setState` in an effect (which renders a throwaway frame). It is only
   * ever evaluated on the client, because `hasMounted` gates it.
   */
  const play = useMemo(() => hasMounted && shouldPlay(), [hasMounted])

  if (!play) return null

  return <Curtain />
}

function Curtain() {
  const t = useTranslations('intro')
  const [phase, setPhase] = useState<'playing' | 'leaving'>('playing')
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
    if (phase !== 'playing') return

    const dismiss = () => {
      setPhase('leaving')
      window.setTimeout(() => setGone(true), EXIT)
    }

    // Auto-advance, plus every obvious way to say "skip".
    timersRef.current.push(window.setTimeout(dismiss, HOLD))
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
  }, [phase])

  if (gone) return null

  const leaving = phase === 'leaving'

  return (
    <div
      /*
       * `aria-hidden` and no focusable children: the curtain says nothing the
       * page does not already say in its own headings, so for a screen reader
       * it is pure decoration to skip past. `role="presentation"` would still
       * announce the text inside it.
       */
      aria-hidden
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center overflow-hidden',
        'transition-[opacity,transform] ease-[var(--ease-emphasis)]',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      style={{
        background: 'var(--surface-base)',
        transitionDuration: `${EXIT}ms`,
        // Lifts away rather than fading in place, so the reveal has direction.
        transform: leaving ? 'translateY(-1.5%)' : 'none',
      }}
    >
      {/* Same accent bloom as the hero, so the curtain reads as the page's
          own first frame rather than as a separate splash screen. */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(62% 38% at 50% 42%, color-mix(in srgb, var(--color-acento) 20%, transparent) 0%, transparent 100%)',
            'radial-gradient(48% 30% at 82% 88%, color-mix(in srgb, var(--color-acento-deep) 24%, transparent) 0%, transparent 100%)',
          ].join(', '),
        }}
      />

      {/* The masked rule grid from the hero, at the same 64px pitch. */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: [
            'linear-gradient(to right, color-mix(in srgb, var(--color-neutro-claro) 4%, transparent) 1px, transparent 1px)',
            'linear-gradient(to bottom, color-mix(in srgb, var(--color-neutro-claro) 4%, transparent) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(58% 46% at 50% 46%, #000 0%, transparent 76%)',
          WebkitMaskImage:
            'radial-gradient(58% 46% at 50% 46%, #000 0%, transparent 76%)',
        }}
      />

      <div className="relative flex w-full max-w-[26rem] flex-col items-center px-6 text-center sm:max-w-[34rem]">
        {/* The mark, scaling up out of nothing. */}
        <span className="intro-mark flex h-12 w-12 items-center justify-center rounded-[0.875rem] border border-[var(--accent-hairline)] bg-[var(--accent-soft)] sm:h-14 sm:w-14">
          <span className="intro-spark block h-2.5 w-2.5 rounded-full bg-[var(--color-acento)] sm:h-3 sm:w-3" />
        </span>

        {/* Set in the display face at the headline's own scale. */}
        <p className="intro-line-1 mt-6 font-display text-[1.75rem] font-medium leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] sm:mt-7 sm:text-[2.5rem]">
          {t('brand')}
        </p>

        {/* Draws out from the centre between the two lines. */}
        <span className="intro-rule mt-5 h-px w-16 bg-[linear-gradient(to_right,transparent,var(--color-acento),transparent)] sm:mt-6 sm:w-24" />

        <p className="intro-line-2 mt-5 max-w-[24ch] text-[0.9375rem] leading-[1.55] text-[var(--text-secondary)] sm:mt-6 sm:max-w-[32ch] sm:text-[1.0625rem]">
          {t('tagline')}
        </p>
      </div>
    </div>
  )
}
