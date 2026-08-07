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
  { key: 'services', href: `#${sectionIds.services}` },
  { key: 'packages', href: `#${sectionIds.packages}` },
  { key: 'process', href: `#${sectionIds.process}` },
  { key: 'faq', href: `#${sectionIds.faq}` },
  { key: 'about', href: `#${sectionIds.about}` },
] as const

export function Header() {
  const t = useTranslations('nav')
  const tHero = useTranslations('hero')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
            {navItems.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
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

      <div
        id={menuId}
        hidden={!isMenuOpen}
        className="border-t border-hairline bg-[var(--color-neutro-oscuro)] lg:hidden"
      >
        <nav aria-label={t('mainNav')} className="px-5 pb-8 pt-6 sm:px-8">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
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
