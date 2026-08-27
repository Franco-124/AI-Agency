'use client'

import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'

import { Logo } from '@/components/brand/Logo'
import { usePathname } from '@/i18n/navigation'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

import { LocaleSwitcher } from './LocaleSwitcher'

/*
 * "Servicios" and "Asesoría" are the same errand — what Numi sells — so they
 * collapse into one first-level entry with a menu, which keeps the top level
 * at five items. `children` is what marks an entry as a menu; the flat items
 * render as plain links.
 */
const navItems = [
  {
    key: 'servicesMenu',
    id: sectionIds.services,
    children: [
      { key: 'servicesOverview', descriptionKey: 'servicesOverviewDesc', id: sectionIds.services },
      { key: 'advisory', descriptionKey: 'advisoryDesc', id: sectionIds.advisory },
    ],
  },
  { key: 'packages', id: sectionIds.packages },
  { key: 'process', id: sectionIds.process },
  { key: 'faq', id: sectionIds.faq },
  { key: 'about', id: sectionIds.about },
] as const

/** Every section id the nav can highlight, menu children included. */
const trackedSections = navItems.flatMap((item) =>
  'children' in item ? item.children.map((child) => child.id) : [item.id],
)

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const menuId = useId()
  const dropdownId = useId()
  const navRef = useRef<HTMLElement>(null)

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

      for (const id of trackedSections) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= ACTIVE_OFFSET) {
          current = id
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

  /*
   * The dropdown closes on Escape and on any pointer landing outside the nav.
   * Escape also returns focus to the trigger, so keyboard users are not
   * dropped back at the top of the document.
   */
  useEffect(() => {
    if (!openDropdown) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenDropdown(null)
      navRef.current
        ?.querySelector<HTMLButtonElement>(`[data-dropdown-trigger="${openDropdown}"]`)
        ?.focus()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenDropdown(null)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [openDropdown])

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

        <nav ref={navRef} aria-label={t('mainNav')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const children = 'children' in item ? item.children : null
              // A menu counts as current when any section inside it is.
              const isActive = children
                ? children.some((child) => child.id === activeId)
                : activeId === item.id
              const isOpen = openDropdown === item.key

              const underline = (
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-3 bottom-1 h-px origin-left bg-[var(--color-acento)] transition-transform duration-300 ease-out',
                    isActive ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              )

              if (!children) {
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
                      {underline}
                    </a>
                  </li>
                )
              }

              return (
                <li
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.key)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    data-dropdown-trigger={item.key}
                    aria-expanded={isOpen}
                    aria-controls={`${dropdownId}-${item.key}`}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => setOpenDropdown(isOpen ? null : item.key)}
                    className={cn(
                      'relative flex items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors duration-200',
                      isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {t(item.key)}
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                    />
                    {underline}
                  </button>

                  {/*
                    Kept mounted so the open/close can transition, and made
                    `inert` while closed so its links stay out of tab order and
                    out of the accessibility tree.
                  */}
                  <div
                    id={`${dropdownId}-${item.key}`}
                    inert={!isOpen}
                    className={cn(
                      'absolute left-0 top-full w-72 pt-2 transition-all duration-200 ease-out',
                      isOpen
                        ? 'translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-1 opacity-0',
                    )}
                  >
                    <ul className="overflow-hidden rounded-xl border border-hairline bg-[var(--color-primario)] p-1.5 shadow-[0_20px_45px_-12px_color-mix(in_srgb,var(--color-neutro-oscuro)_85%,transparent)]">
                      {children.map((child) => (
                        <li key={child.key}>
                          <a
                            href={sectionHref(child.id)}
                            onClick={() => setOpenDropdown(null)}
                            aria-current={activeId === child.id ? 'location' : undefined}
                            className="block rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-neutro-claro)_6%,transparent)]"
                          >
                            <span className="block text-sm text-ink">{t(child.key)}</span>
                            <span className="mt-0.5 block text-xs text-ink-faint">
                              {t(child.descriptionKey)}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
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
          {/*
            No dropdown on the phone: the panel has the room to list every
            destination flat, and a nested disclosure would only add a tap
            between the visitor and the section. The grouped entry becomes a
            heading with its children indented under it.
          */}
          <ul className="flex flex-col gap-1">
            {navItems.map((item) =>
              'children' in item ? (
                <li key={item.key}>
                  <span className="flex min-h-11 items-center px-3 text-xs uppercase tracking-[0.16em] text-ink-faint">
                    {t(item.key)}
                  </span>
                  <ul className="flex flex-col gap-1">
                    {item.children.map((child) => (
                      <li key={child.key}>
                        <a
                          href={sectionHref(child.id)}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex min-h-11 items-center rounded-lg px-3 text-lg text-ink-muted transition-colors duration-200 hover:text-ink"
                        >
                          {t(child.key)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.key}>
                  <a
                    href={sectionHref(item.id)}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-lg px-3 text-lg text-ink-muted transition-colors duration-200 hover:text-ink"
                  >
                    {t(item.key)}
                  </a>
                </li>
              ),
            )}
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
