'use client'

import { Clock, MessageCircle } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { LazyMotionProvider } from '@/components/motion/LazyMotionProvider'
import { cn } from '@/lib/utils'

const EASE = [0.22, 0.61, 0.36, 1] as const

/**
 * Four turns plus one interruption: the first reply is held back long enough
 * for an unanswered "ghost" bubble to sit in its place before being replaced —
 * the hero's whole claim (an unanswered message costs money; Numi answers
 * instantly) shown once, literally, instead of stated only in copy.
 */
const messages = [
  { key: 'one', from: 'client', delay: 0.4 },
  { key: 'two', from: 'numi', delay: 1.05 },
  { key: 'three', from: 'client', delay: 1.5 },
  { key: 'four', from: 'numi', delay: 1.9 },
] as const

const CARD_DELAY = 0.2
const PENDING_DELAY = 0.65
const PENDING_DURATION = 0.55
const META_DELAY = 2.25

const bubbleClasses = (from: 'client' | 'numi') =>
  cn(
    'max-w-[85%] rounded-xl px-3 py-2 text-sm text-[var(--color-neutro-claro)]',
    from === 'client'
      ? 'rounded-tl-sm bg-[var(--color-secundario)]'
      : 'ml-auto rounded-tr-sm border border-[var(--accent-hairline)] bg-[var(--accent-soft)]',
  )

/**
 * Illustrative WhatsApp exchange shown beside the hero copy: it fills the right
 * half with proof of what the product actually does instead of decoration.
 *
 * Not a functional chat — the real entry point is the floating WhatsApp button.
 */
export function HeroChatCard() {
  const t = useTranslations('hero.chat')
  const prefersReducedMotion = useReducedMotion()

  const enter = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay, ease: EASE },
        }

  return (
    <LazyMotionProvider>
      <m.aside
        {...enter(CARD_DELAY)}
        aria-label={t('ariaLabel')}
        className="ml-auto w-full max-w-[20rem] rounded-2xl border border-hairline-strong bg-[var(--color-primario)] p-4"
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
            <span className="block text-xs text-ink-faint">{t('status')}</span>
          </span>
        </header>

        <ol className="flex flex-col gap-2">
          {messages.map(({ key, from, delay }) => {
            if (key !== 'two') {
              return (
                <m.li key={key} {...enter(delay)} className={bubbleClasses(from)}>
                  {t(`messages.${key}`)}
                </m.li>
              )
            }

            /*
              The first reply's slot doubles as the stage for the ghost bubble:
              stacked in the same box via `relative`/`absolute` so the ghost's
              fade-out never reserves layout space once it is gone.
            */
            return (
              <li key={key} className="relative">
                <m.div {...enter(delay)} className={bubbleClasses(from)}>
                  {t(`messages.${key}`)}
                </m.div>

                {!prefersReducedMotion ? (
                  <m.div
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{
                      delay: PENDING_DELAY,
                      duration: PENDING_DURATION,
                      times: [0, 0.3, 0.7, 1],
                      ease: EASE,
                    }}
                    className="absolute right-0 top-0 flex items-center gap-1.5 rounded-xl rounded-tr-sm border border-dashed border-[var(--surface-border-strong)] bg-[var(--color-primario)] px-3 py-2 text-sm text-ink-faint"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    {t('pending')}
                  </m.div>
                ) : null}
              </li>
            )
          })}
        </ol>

        <m.p {...enter(META_DELAY)} className="mt-3 text-right text-[11px] text-ink-faint">
          {t('meta')}
        </m.p>
      </m.aside>
    </LazyMotionProvider>
  )
}
