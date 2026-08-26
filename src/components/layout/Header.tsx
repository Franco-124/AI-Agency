'use client'

import { ArrowRight, Menu, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useState } from 'react'

import { Logo } from '@/components/brand/Logo'
import { usePathname } from '@/i18n/navigation'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

import { LocaleSwitcher } from './LocaleSwitcher'

const navItems = [
  { key: 'services', id: sectionIds.services },
  { key: 'packages', id: sectionIds.packages },
  { key: 'advisory', id: sectionIds.advisory },
  { key: 'process', id: sectionIds.process },
  { key: 'faq', id: sectionIds.faq },
  { key: 'about', id: sectionIds.about },
] as const

/** Distance below the header at which a section counts as the current one. */
const ACTIVE_OFFSET = 140

export function Header() {
  const t = useTranslations('nav')
  const tHero = useTranslations('hero')
  const locale = useLocale()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuId = useId()

  /*
   * Section anchors only exist on the home page. Elsewhere (e.g. /privacidad)
   * a bare `#id` is a same-page fragment that goes nowhere, so it must resolve
   * to a real navigation back to the home page first.
   */
  const isHome = pathname === '/'
  const sectionHref = (id: string) => (isHome ? `#${id}` : `/${locale}#${id}`)

  /*
   * One rAF-throttled listener drives both the header surface and the current
   * section, instead of a listener per concern each doing its own layout read.
   */
  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      setIsScrolled(window.scrollY > 16)

      // Last section whose top has crossed the header wins; null above them all.
      let current: string | null = null

      for (const item of navItems) {
        const element = document.getElementById(item.id)
        if (element && element.getBoundingClientRect().top <= ACTIVE_OFFSET) {
          current = item.id
        }
      }

      setActiveId(current)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Lock body scroll and allow Escape to close while the mobile panel is open.
  useEffect(() => {
    if (!isMenuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        isScrolled || isMenuOpen
          ? 'border-b border-hairline bg-[var(--color-neutro-oscuro)]'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <a
        href="#contenido"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-10 focus-visible:rounded-lg focus-visible:bg-[var(--color-acento)] focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-[var(--color-neutro-oscuro)]"
      >
        {t('skipToContent')}
      </a>

      <div className="mx-auto flex h-[var(--header-height)] max-w-[80rem] items-center justify-between gap-6 px-5 sm:px-8">
        <Logo label={t('home')} />

        <nav aria-label={t('mainNav')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeId === item.id

              return (
                <li key={item.key}>
                  <a
                    href={sectionHref(item.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'relative rounded-md px-3 py-2 text-sm transition-colors duration-200',
                      isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {t(item.key)}
                    {/* Marks where the visitor is without moving anything. */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-x-3 bottom-1 h-px origin-left bg-[var(--color-acento)] transition-transform duration-300 ease-out',
                        isActive ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <LocaleSwitcher label={t('languageLabel')} className="hidden sm:inline-flex" />

          {/*
            Deliberately no button chrome: the toggle and the hero CTA are the
            two accents that need to stand out on this screen, so the nav CTA
            reads as a plain link — only the arrow carries the orange.
          */}
          <a
            href={sectionHref(sectionIds.finalCta)}
            className="group hidden min-h-11 items-center gap-1.5 px-2 text-sm font-medium text-ink md:inline-flex"
          >
            {tHero('cta')}
            <ArrowRight
              aria-hidden
              className="h-4 w-4 shrink-0 text-[var(--color-acento)] transition-transform duration-150 ease-out group-hover:translate-x-1"
            />
          </a>

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-hairline text-ink transition-colors duration-200 hover:border-hairline-strong lg:hidden"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/*
        The panel slides open by animating its grid track from 0fr to 1fr, which
        the `hidden` attribute cannot do. It stays in the DOM either way, so
        `inert` is what removes the collapsed links from tab order and from
        assistive technology.
      */}
      <div
        className={cn(
          'grid overflow-hidden border-t transition-[grid-template-rows,border-color] duration-300 ease-out lg:hidden',
          isMenuOpen
            ? 'grid-rows-[1fr] border-hairline'
            : 'grid-rows-[0fr] border-transparent',
          isScrolled || isMenuOpen
            ? 'bg-[var(--color-neutro-oscuro)]'
            : 'bg-transparent',
        )}
      >
        <nav
          id={menuId}
          aria-label={t('mainNav')}
          inert={!isMenuOpen}
          className={cn(
            'overflow-hidden px-5 pb-8 pt-6 transition-opacity duration-200 sm:px-8',
            isMenuOpen ? 'opacity-100 delay-100' : 'opacity-0',
          )}
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.key}>
                <a
                  href={sectionHref(item.id)}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-lg text-ink-muted transition-colors duration-200 hover:text-ink"
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-4">
            <a
              href={sectionHref(sectionIds.finalCta)}
              onClick={() => setIsMenuOpen(false)}
              className="group flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-lg text-ink"
            >
              {tHero('cta')}
              <ArrowRight
                aria-hidden
                className="h-5 w-5 shrink-0 text-[var(--color-acento)] transition-transform duration-150 ease-out group-hover:translate-x-1"
              />
            </a>
            <LocaleSwitcher
              label={t('languageLabel')}
              variant="inline"
              className="w-full sm:hidden"
            />
          </div>
        </nav>
      </div>
    </header>
  )
}
