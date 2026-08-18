'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { whatsappUrl } from '@/lib/site'

/**
 * Official WhatsApp glyph. Not in lucide (icon-only, no brand marks), so it
 * ships as a plain inline SVG rather than pulling in a whole icon-brand
 * package for one mark.
 */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.98.573 3.827 1.563 5.383L2 22l4.735-1.539A9.953 9.953 0 0 0 12.001 22C17.523 22 22 17.522 22 12S17.523 2 12.001 2zm0 18.13a8.12 8.12 0 0 1-4.14-1.135l-.297-.176-3.07.998.996-3.07-.187-.309A8.13 8.13 0 1 1 20.13 12a8.14 8.14 0 0 1-8.129 8.13z" />
    </svg>
  )
}

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
 * A dark, icon-only circle — the orange icon is the only accent, so it reads
 * as a quiet utility button rather than competing with the hero CTA.
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
        className="inline-flex h-14 w-14 items-center justify-center rounded-full border-[0.5px] border-[#3d434a] bg-[var(--color-primario)] text-[var(--color-acento)] transition-transform duration-200 ease-out motion-safe:hover:-translate-y-0.5"
      >
        <WhatsAppIcon className="h-6 w-6 shrink-0" />
      </a>
    </div>
  )
}
