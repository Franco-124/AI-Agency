'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

/**
 * Fixed bottom action bar — phones and small tablets only.
 *
 * The site's primary action used to live in two places on a phone: the hero's
 * own CTA (which scrolls away after the first screen) and a link buried inside
 * the header's hamburger panel — two taps away, in the hardest part of the
 * screen to reach one-handed. For the rest of a long landing there was no way
 * to act without scrolling back.
 *
 * A persistent bar in the thumb zone is the established pattern for exactly
 * this: the action follows the reader instead of the reader hunting for it.
 *
 * It carries one action, not two. WhatsApp already has a permanent entry point
 * in `WhatsAppFab`, which sits directly above this bar — offering it here as
 * well would put the same destination on screen twice, and a two-button bar
 * splits the decision at the moment the page is trying to make one.
 *
 * Three details make it behave rather than nag:
 *
 * 1. It stays hidden until the hero's own CTA has scrolled out of view, so the
 *    two never compete, and hides again over the final form — where the real
 *    submit button is already on screen and a floating duplicate would cover it.
 * 2. It is `lg:hidden`. On a desktop the header CTA is always visible and a
 *    fixed bottom bar would be pure chrome.
 * 3. The page reserves room for it at the bottom (see `.has-mobile-bar` in
 *    `globals.css`), so it can never cover the end of the content.
 */
export function MobileActionBar() {
  const t = useTranslations('hero')
  const [isVisible, setIsVisible] = useState(false)
  const frameRef = useRef(0)

  useEffect(() => {
    const update = () => {
      frameRef.current = 0

      /*
       * Two gates, both read from real element positions rather than from a
       * scroll threshold in pixels — a hard-coded offset breaks the moment the
       * hero's height changes.
       */
      const heroCta = document.querySelector<HTMLElement>('[data-hero-cta]')
      const finalCta = document.getElementById(sectionIds.finalCta)

      // Show once the hero's own CTA has left the viewport.
      const heroCtaGone = heroCta
        ? heroCta.getBoundingClientRect().bottom < 0
        : window.scrollY > window.innerHeight * 0.6

      // Hide again once the form section is on screen.
      const atForm = finalCta
        ? finalCta.getBoundingClientRect().top < window.innerHeight * 0.8
        : false

      const next = heroCtaGone && !atForm
      setIsVisible(next)

      /*
       * Published on the document element so CSS can react — it is what lifts
       * the WhatsApp FAB clear of the bar (see `--fab-offset` in globals.css).
       * An attribute rather than more React state: the FAB is a sibling
       * component with no reason to re-render for this.
       */
      document.documentElement.dataset.barVisible = String(next)
    }

    const onScroll = () => {
      if (frameRef.current) return
      frameRef.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      // Otherwise a route change away from the landing leaves the FAB
      // permanently lifted over a bar that no longer exists.
      delete document.documentElement.dataset.barVisible
    }
  }, [])

  return (
    <div
      /*
       * `inert` while hidden, not just transparent: a translucent bar that has
       * slid off screen would otherwise still be in the tab order and still
       * take taps along the bottom edge.
       */
      inert={!isVisible}
      aria-hidden={!isVisible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 lg:hidden',
        'border-t border-hairline',
        'bg-[color-mix(in_srgb,var(--surface-base)_88%,transparent)]',
        'backdrop-blur-xl backdrop-saturate-150',
        'transition-[transform,opacity] duration-300 ease-[var(--ease-emphasis)]',
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
      )}
      style={{
        // Clears the iOS home indicator / Android gesture bar.
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      {/*
        Full-width button, and `pr-20` to clear the WhatsApp FAB that sits at
        the bottom-right — without it the bar would slide underneath the FAB and
        the two would overlap on the corner most thumbs land on.

        The label reuses `hero.cta`, so one action has one name across the site.
      */}
      <div className="px-4 pb-1 pt-3 pr-20">
        <Link
          href="/agendar#reserva"
          className={cn(
            'btn-volume group/bar flex min-h-12 w-full items-center justify-center gap-2',
            'rounded-[0.625rem] text-[0.9375rem] font-semibold tracking-[-0.01em]',
            'transition-[transform,background-color,box-shadow] duration-200 ease-out',
            'active:translate-y-px',
          )}
        >
          {t('cta')}
          <ArrowRight
            aria-hidden
            className="h-4 w-4 shrink-0 transition-transform duration-200 ease-[var(--ease-emphasis)] group-hover/bar:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  )
}
