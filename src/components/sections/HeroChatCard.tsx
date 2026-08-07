'use client'

import { MessageCircle } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { LazyMotionProvider } from '@/components/motion/LazyMotionProvider'
import { cn } from '@/lib/utils'

const EASE = [0.22, 0.61, 0.36, 1] as const

/**
 * The four turns land in sequence rather than all at once: it reads as a live
 * conversation being answered instantly, which is the actual claim of the page.
 *
 * The gaps are deliberately tight (the whole exchange resolves in ~2s). A slower
 * cadence contradicts the claim and, worse, is still mid-animation by the time a
 * visitor has scrolled past the hero.
 */
const messages = [
  { key: 'one', from: 'client', delay: 0.45 },
  { key: 'two', from: 'numi', delay: 0.85 },
  { key: 'three', from: 'client', delay: 1.3 },
  { key: 'four', from: 'numi', delay: 1.7 },
] as const

/** Card frame first, then the turns inside it. */
const CARD_DELAY = 0.25
const META_DELAY = 2.05

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
          {messages.map(({ key, from, delay }) => (
            <m.li
              key={key}
              {...enter(delay)}
              className={cn(
                'max-w-[85%] rounded-xl px-3 py-2 text-sm text-[var(--color-neutro-claro)]',
                from === 'client'
                  ? 'rounded-tl-sm bg-[var(--color-secundario)]'
                  : 'ml-auto rounded-tr-sm border border-[var(--accent-hairline)] bg-[var(--accent-soft)]',
              )}
            >
              {t(`messages.${key}`)}
            </m.li>
          ))}
        </ol>

        <m.p {...enter(META_DELAY)} className="mt-3 text-right text-[11px] text-ink-faint">
          {t('meta')}
        </m.p>
      </m.aside>
    </LazyMotionProvider>
  )
}
