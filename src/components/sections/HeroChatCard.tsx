'use client'

import { CheckCheck, MessageCircle } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { LazyMotionProvider } from '@/components/motion/LazyMotionProvider'
import { cn } from '@/lib/utils'

const EASE = [0.22, 0.61, 0.36, 1] as const

/**
 * Eight turns covering a full cycle — book, confirm, resolve a follow-up
 * question, close — instead of stopping at the booking step. Messages start
 * from zero and land one at a time, each preceded by a "typing…" beat before
 * a Numi reply, so the panel plays out like a conversation actually
 * happening rather than a paragraph that fades in all at once.
 */
const messages = [
  { key: 'one', from: 'client', time: 'timeOne' },
  { key: 'two', from: 'numi', time: 'timeTwo', status: 'delivered' },
  { key: 'three', from: 'client', time: 'timeThree' },
  { key: 'four', from: 'numi', time: 'timeFour', status: 'delivered' },
  { key: 'five', from: 'client', time: 'timeFive' },
  { key: 'six', from: 'numi', time: 'timeSix', status: 'delivered' },
  { key: 'seven', from: 'client', time: 'timeSeven' },
  { key: 'eight', from: 'numi', time: 'timeEight', status: 'read' },
] as const

/**
 * The niches the card cycles through. Each key is a namespace under
 * `hero.chat` holding its own name/status/messages, so a variant is a copy
 * change rather than a code change. Order is the order they play.
 */
const niches = ['realEstate', 'clinic', 'vet'] as const

/*
 * Pacing. The exchange used to run on flat per-role delays, which is what made
 * it read as a canned loop: a two-word reply took exactly as long to arrive as
 * a three-line one, and the whole thing was over before it registered as a
 * conversation. The timings below are derived from the message text instead,
 * so length drives duration the way it does with a real person.
 */

const START_DELAY = 1100

/** Time before a client message lands — they are reading the reply first. */
const CLIENT_BASE = 1400
/** Added per character of the message they are about to send. */
const CLIENT_PER_CHAR = 28

/** The agent's pause before the typing indicator appears. */
const NUMI_THINKING = 900
/** Floor and per-character cost of the "typing…" beat, then the send pause. */
const TYPING_BASE = 800
const TYPING_PER_CHAR = 22
const NUMI_GAP = 400

/** Nothing may outstay this, however long the message. */
const MAX_TYPING = 3200
const MAX_CLIENT_GAP = 3600

/** How long a finished conversation stays on screen before the next niche. */
const NICHE_HOLD = 6000
/** Cross-fade at the swap. Matches the `duration-300` on the wrapper below. */
const FADE_DURATION = 300

const clamp = (value: number, max: number) => Math.min(value, max)

/** How long the agent appears to spend typing a given message. */
const typingDurationFor = (text: string) =>
  clamp(TYPING_BASE + text.length * TYPING_PER_CHAR, MAX_TYPING)

/** How long before the client's next message lands. */
const clientDelayFor = (text: string) =>
  clamp(CLIENT_BASE + text.length * CLIENT_PER_CHAR, MAX_CLIENT_GAP)

const bubbleClasses = (from: 'client' | 'numi') =>
  cn(
    'max-w-[78%] rounded-[14px] px-3.5 py-2.5 text-sm leading-normal',
    from === 'client'
      ? 'rounded-tl-[4px] border border-[rgba(245,243,248,0.12)] bg-[rgba(245,243,248,0.06)] text-[var(--text-secondary)]'
      : 'ml-auto rounded-tr-[4px] border border-[color-mix(in_srgb,var(--color-acento)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-acento)_18%,transparent)] text-[var(--color-neutro-claro)]',
  )

const CheckMark = ({ status }: { status: 'delivered' | 'read' }) =>
  status === 'read' ? (
    <CheckCheck className="h-3.5 w-3.5 shrink-0 text-[var(--color-neutro-claro)]" strokeWidth={2} aria-hidden />
  ) : (
    <CheckCheck className="h-3.5 w-3.5 shrink-0 text-[color-mix(in_srgb,var(--color-neutro-claro)_55%,transparent)]" strokeWidth={2} aria-hidden />
  )

const TypingBubble = () => (
  <m.div
    aria-hidden
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25, ease: EASE }}
    className="ml-auto flex w-fit items-center gap-1 rounded-[14px] rounded-tr-[4px] border border-[color-mix(in_srgb,var(--color-acento)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-acento)_18%,transparent)] px-3.5 py-2.5"
  >
    {[0, 1, 2].map((dot) => (
      <m.span
        key={dot}
        className="h-1.5 w-1.5 rounded-full bg-[var(--color-neutro-claro)]"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </m.div>
)

/**
 * One niche's conversation, replayed from empty. Mounted under a `key` of the
 * niche, so switching niches remounts it and the replay state resets by
 * construction rather than by clearing it inside an effect.
 *
 * Only the messages vary per niche. The header always presents the agent as
 * Numi AI: the card demonstrates what the agent does, so putting a client's
 * name on it would read as a specific customer's private conversation.
 */
function ChatTranscript({
  niche,
  prefersReducedMotion,
  onComplete,
}: {
  niche: (typeof niches)[number]
  prefersReducedMotion: boolean
  onComplete: () => void
}) {
  const t = useTranslations('hero.chat')
  const tNiche = useTranslations(`hero.chat.${niche}`)
  const scrollRef = useRef<HTMLOListElement>(null)

  const [visibleCount, setVisibleCount] = useState(prefersReducedMotion ? messages.length : 0)
  const [typing, setTyping] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) return

    let cancelled = false
    const timers: number[] = []

    /*
     * Every step is scheduled up front against one running clock, so a step's
     * own duration is what pushes the next one out. `typingDurationFor` and
     * `clientDelayFor` read the resolved copy, which is why the schedule is
     * built here rather than hoisted to a module constant: the text differs
     * per niche and per locale.
     */
    let cumulative = START_DELAY

    messages.forEach((message, index) => {
      const text = tNiche(`messages.${message.key}`)

      if (message.from === 'numi') {
        const typingDuration = typingDurationFor(text)
        const showTypingAt = cumulative + NUMI_THINKING

        timers.push(
          window.setTimeout(() => {
            if (!cancelled) setTyping(true)
          }, showTypingAt),
        )

        timers.push(
          window.setTimeout(() => {
            if (cancelled) return
            setTyping(false)
            setVisibleCount(index + 1)
          }, showTypingAt + typingDuration),
        )

        cumulative = showTypingAt + typingDuration + NUMI_GAP
      } else {
        // The client reads the previous reply before answering, so their delay
        // is sized by the message they are about to send.
        cumulative += clientDelayFor(text)

        timers.push(
          window.setTimeout(() => {
            if (!cancelled) setVisibleCount(index + 1)
          }, cumulative),
        )
      }
    })

    /*
     * Hand off to the next niche only once the conversation has finished
     * playing. Swapping on a fixed 4-5s interval would cut the exchange off
     * mid-reply — the card would never show a booking actually completing,
     * which is the one thing it exists to demonstrate. The fade starts
     * FADE_DURATION before the swap so the outgoing text is gone by the time
     * the incoming copy mounts.
     */
    timers.push(
      window.setTimeout(() => {
        if (cancelled) return
        setFadingOut(true)
      }, cumulative + NICHE_HOLD),
    )

    timers.push(
      window.setTimeout(() => {
        if (!cancelled) onComplete()
      }, cumulative + NICHE_HOLD + FADE_DURATION),
    )

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [prefersReducedMotion, onComplete, tNiche])

  // Follow the conversation as each bubble (or the typing indicator) lands.
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [visibleCount, typing, prefersReducedMotion])

  const showFooter = visibleCount >= messages.length

  return (
    <>
        <header className="mb-3 flex items-center gap-2.5 border-b border-hairline pb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)]">
            <MessageCircle
              className="h-4 w-4 text-[var(--color-acento)]"
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
          <span>
            <span className="block text-sm font-medium text-[var(--color-neutro-claro)]">
              {t('name')}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink-faint">
              <span aria-hidden className="h-2 w-2 rounded-full bg-[#4ADE80]" />
              {t('status')}
            </span>
          </span>
        </header>

        <div
          className={cn(
            'relative transition-opacity duration-300',
            fadingOut ? 'opacity-0' : 'opacity-100',
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-[color-mix(in_srgb,var(--color-primario)_82%,transparent)] to-transparent"
          />

          <ol
            ref={scrollRef}
            className="scrollbar-none flex h-80 flex-col gap-2.5 overflow-y-auto scroll-smooth pt-1"
          >
            {messages.slice(0, visibleCount).map((message) => {
              const { key, from, time } = message
              const status = 'status' in message ? message.status : undefined

              return (
                <m.li
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className={bubbleClasses(from)}>
                    <p>{tNiche(`messages.${key}`)}</p>
                    <span
                      className={cn(
                        'mt-1 flex items-center gap-1 text-[11px] text-[color-mix(in_srgb,var(--text-secondary)_75%,transparent)]',
                        from === 'numi' && 'justify-end',
                      )}
                    >
                      {t(time)}
                      {from === 'numi' && status ? <CheckMark status={status} /> : null}
                    </span>
                  </div>
                </m.li>
              )
            })}

            {typing ? (
              <li>
                <TypingBubble />
              </li>
            ) : null}
          </ol>
        </div>

        <m.p
          initial={false}
          animate={{ opacity: showFooter ? 1 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mt-3 text-center text-[11px] text-ink-faint"
        >
          {t('meta')}
        </m.p>
    </>
  )
}

/**
 * Illustrative WhatsApp exchange shown beside the hero copy: it fills the right
 * half with proof of what the product actually does instead of decoration.
 *
 * Not a functional chat — the real entry point is the floating WhatsApp button.
 * The card cycles through one conversation per niche, each replaying from an
 * empty panel, so a visitor from any of the three sees their own business
 * reflected rather than a generic booking.
 */
export function HeroChatCard() {
  const t = useTranslations('hero.chat')
  const prefersReducedMotion = useReducedMotion()

  /*
   * Under reduced motion this stays at 0 for good: one conversation, shown in
   * full, with no rotation and no cross-fade — which is the point of the
   * preference. Everyone else cycles through all three.
   */
  const [nicheIndex, setNicheIndex] = useState(0)

  /*
   * Stable across renders on purpose: the transcript lists it as a dependency
   * of the effect that schedules the whole replay, so a fresh function each
   * render would tear the timers down and restart the conversation on every
   * bubble. The updater form means it never needs to close over the index.
   */
  const advance = useCallback(() => {
    if (prefersReducedMotion) return
    setNicheIndex((index) => (index + 1) % niches.length)
  }, [prefersReducedMotion])

  return (
    <LazyMotionProvider>
      <m.aside
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        aria-label={t('ariaLabel')}
        className="ml-auto w-full max-w-[20rem] rounded-2xl border border-[rgba(245,243,248,0.08)] bg-[color-mix(in_srgb,var(--color-primario)_82%,transparent)] p-4 shadow-[0_25px_60px_-12px_color-mix(in_srgb,var(--color-neutro-oscuro)_85%,transparent)] backdrop-blur-md"
      >
        <ChatTranscript
          key={niches[nicheIndex]}
          niche={niches[nicheIndex]}
          prefersReducedMotion={Boolean(prefersReducedMotion)}
          onComplete={advance}
        />
      </m.aside>
    </LazyMotionProvider>
  )
}
