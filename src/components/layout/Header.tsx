'use client'

import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useState } from 'react'

import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

import { LocaleSwitcher } from './LocaleSwitcher'

const navItems = [
  { key: 'services', id: sectionIds.services },
  { key: 'packages', id: sectionIds.packages },
  { key: 'process', id: sectionIds.process },
  { key: 'faq', id: sectionIds.faq },
  { key: 'about', id: sectionIds.about },
] as const

/** Distance below the header at which a section counts as the current one. */
const ACTIVE_OFFSET = 140

export function Header() {
  const t = useTranslations('nav')
  const tHero = useTranslations('hero')
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuId = useId()

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
                    href={`#${item.id}`}
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

          <Button asChild size="sm" className="hidden md:inline-flex">
            <a href={`#${sectionIds.finalCta}`}>{tHero('cta')}</a>
          </Button>

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
                  href={`#${item.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-lg text-ink-muted transition-colors duration-200 hover:text-ink"
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-4">
            <Button asChild size="lg" block>
              <a href={`#${sectionIds.finalCta}`} onClick={() => setIsMenuOpen(false)}>
                {tHero('cta')}
              </a>
            </Button>
            <LocaleSwitcher label={t('languageLabel')} className="self-start sm:hidden" />
          </div>
        </nav>
      </div>
    </header>
  )
}
