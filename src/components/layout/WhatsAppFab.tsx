'use client'

import { MessageCircle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { whatsappUrl } from '@/lib/site'

const DISMISSED_KEY = 'numi:whatsapp-greeting-dismissed'
const GREETING_DELAY = 4000
/** How long the greeting stays up on its own before retiring. */
const GREETING_LIFETIME = 7000
/** Scrolling this far past the point where it appeared retires it early. */
const SCROLL_DISMISS_DISTANCE = 150

const markDismissed = () => {
  try {
    sessionStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    // Private browsing modes can refuse storage — hiding it for this view is enough.
  }
}

/**
 * Persistent WhatsApp entry point.
 *
 * The button carries a visible label on desktop and collapses to the icon on
 * mobile. The link is pre-filled so the chat opens with a first message already
 * written — the visitor never lands on an empty thread.
 *
 * A greeting bubble appears once per session and is suppressed for the rest of
 * the session as soon as it is dismissed or the button is used.
 */
export function WhatsAppFab() {
  const t = useTranslations('whatsapp')
  const [showGreeting, setShowGreeting] = useState(false)

  const href = `${whatsappUrl}?text=${encodeURIComponent(t('prefill'))}`

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    const timer = window.setTimeout(() => setShowGreeting(true), GREETING_DELAY)
    return () => window.clearTimeout(timer)
  }, [])

  /*
   * Once visible, the greeting retires on its own: either after its lifetime or
   * as soon as the visitor scrolls away. A fixed bubble that outlives its moment
   * ends up covering unrelated content further down the page.
   */
  useEffect(() => {
    if (!showGreeting) return

    const anchor = window.scrollY

    const retire = () => {
      setShowGreeting(false)
      markDismissed()
    }

    const onScroll = () => {
      if (Math.abs(window.scrollY - anchor) > SCROLL_DISMISS_DISTANCE) retire()
    }

    const timer = window.setTimeout(retire, GREETING_LIFETIME)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [showGreeting])

  const dismissGreeting = () => {
    setShowGreeting(false)
    markDismissed()
  }

  return (
    <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex flex-col items-end gap-3">
      {showGreeting ? (
        <div
          role="status"
          className="relative max-w-[15rem] rounded-xl rounded-br-sm border border-hairline-strong bg-[var(--color-primario)] px-4 py-3 pr-8 text-sm leading-relaxed text-[var(--color-neutro-claro)] motion-safe:animate-[greeting-in_320ms_ease-out]"
        >
          <button
            type="button"
            onClick={dismissGreeting}
            aria-label={t('close')}
            className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded text-ink-faint transition-colors duration-200 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
          {t('greeting')}
        </div>
      ) : null}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('ariaLabel')}
        onClick={dismissGreeting}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--color-acento)] px-4 font-medium text-[var(--color-neutro-oscuro)] transition-[transform,filter] duration-200 ease-out motion-safe:hover:-translate-y-0.5 sm:px-5 hover:brightness-110"
      >
        <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
        <span className="hidden text-sm sm:inline">{t('label')}</span>
      </a>
    </div>
  )
}
