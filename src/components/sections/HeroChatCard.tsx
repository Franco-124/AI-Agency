'use client'

import { CheckCheck, MessageCircle } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

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

const START_DELAY = 500
const CLIENT_GAP = 900
const TYPING_DURATION = 900
const NUMI_GAP = 450

/** One entry per message: how long to wait after the previous step before it appears. */
const stepDelays = messages.map((message) =>
  message.from === 'numi' ? TYPING_DURATION + NUMI_GAP : CLIENT_GAP,
)

const bubbleClasses = (from: 'client' | 'numi') =>
  cn(
    'max-w-[78%] rounded-[14px] px-3.5 py-2.5 text-sm leading-normal',
    from === 'client'
      ? 'rounded-tl-[4px] border border-[rgba(245,243,248,0.12)] bg-[rgba(245,243,248,0.06)] text-[var(--text-secondary)]'
      : 'btn-glass-primary btn-glass ml-auto rounded-tr-[4px]',
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
    className="btn-glass-primary btn-glass ml-auto flex w-fit items-center gap-1 rounded-[14px] rounded-tr-[4px] px-3.5 py-2.5"
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
 * Illustrative WhatsApp exchange shown beside the hero copy: it fills the right
 * half with proof of what the product actually does instead of decoration.
 *
 * Not a functional chat — the real entry point is the floating WhatsApp button.
 * The exchange replays from scratch on every page load: no messages, then one
 * bubble at a time, auto-scrolling itself as each one lands.
 */
export function HeroChatCard() {
  const t = useTranslations('hero.chat')
  const prefersReducedMotion = useReducedMotion()
  const scrollRef = useRef<HTMLOListElement>(null)

  const [visibleCount, setVisibleCount] = useState(prefersReducedMotion ? messages.length : 0)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) return

    let cancelled = false
    const timers: number[] = []

    const scheduleStep = (index: number, wait: number) => {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return

          const message = messages[index]
          if (message.from === 'numi') {
            setTyping(true)
            timers.push(
              window.setTimeout(() => {
                if (cancelled) return
                setTyping(false)
                setVisibleCount(index + 1)
              }, TYPING_DURATION),
            )
          } else {
            setVisibleCount(index + 1)
          }
        }, wait),
      )
    }

    let cumulative = START_DELAY
    messages.forEach((_, index) => {
      scheduleStep(index, cumulative)
      cumulative += stepDelays[index]
    })

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [prefersReducedMotion])

  // Follow the conversation as each bubble (or the typing indicator) lands.
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [visibleCount, typing, prefersReducedMotion])

  const showFooter = visibleCount >= messages.length

  return (
    <LazyMotionProvider>
      <m.aside
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        aria-label={t('ariaLabel')}
        className="ml-auto w-full max-w-[20rem] rounded-2xl border border-[rgba(245,243,248,0.08)] bg-[color-mix(in_srgb,var(--color-primario)_82%,transparent)] p-4 shadow-[0_20px_40px_rgba(10,5,18,0.4)] backdrop-blur-md"
      >
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

        <div className="relative">
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
                    <p>{t(`messages.${key}`)}</p>
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
      </m.aside>
    </LazyMotionProvider>
  )
}
