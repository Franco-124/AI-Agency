'use client'

import { ArrowRight, Menu, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'

import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { usePathname } from '@/i18n/navigation'
import { lockScroll, unlockScroll } from '@/lib/scroll-lock'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

import { LocaleSwitcher } from './LocaleSwitcher'

/*
 * Four flat links. No dropdown.
 *
 * "Servicios" used to be a disclosure grouping itself with "Asesoría", because
 * the two were one errand — what Numi sells — and splitting them cost a
 * top-level slot. The advisory section is gone, so the menu was left wrapping
 * a single child, and a disclosure that opens to reveal one link is strictly
 * worse than the link. The whole dropdown path went with it: hover intent,
 * the open/close state, the outside-click and Escape handlers, and the
 * `aria-expanded` trigger were all machinery for a menu nothing needs now.
 *
 * "Contacto" is last because it is the errand a visitor runs after the other
 * three have answered their questions. It points at `finalCta`, which already
 * carries the form and the agency's channels — a nav entry that scrolls to
 * the existing ask, not a second place to make it.
 */
const navItems = [
  { key: 'services', id: sectionIds.services },
  { key: 'process', id: sectionIds.process },
  { key: 'faq', id: sectionIds.faq },
  { key: 'contact', id: sectionIds.finalCta },
] as const

/** Every section id the nav can highlight. */
const trackedSections = navItems.map((item) => item.id)

type TrackedSection = (typeof trackedSections)[number]

/** A tracked section's top, measured relative to the document rather than the
    viewport, so the value survives scrolling and only resize invalidates it. */
type SectionOffset = { id: TrackedSection; top: number }

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
  const navRef = useRef<HTMLElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

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
   *
   * The section offsets are measured once and cached, and only re-measured on
   * resize. The previous version called `getBoundingClientRect()` on all
   * eleven tracked sections inside the scroll frame, which forces the browser
   * to flush layout synchronously — on a 14,700px page that was eleven forced
   * reflows per scroll frame, and it is the single most expensive thing that
   * ran during a scroll. Document-relative tops do not change while scrolling,
   * so reading them there was measuring a constant over and over.
   */
  useEffect(() => {
    let frame = 0
    let offsets: SectionOffset[] = []

    const measure = () => {
      const scrollY = window.scrollY

      offsets = trackedSections
        .map((id) => {
          const element = document.getElementById(id)
          if (!element) return null

          return { id, top: element.getBoundingClientRect().top + scrollY }
        })
        .filter((entry): entry is SectionOffset => entry !== null)
        /*
         * `trackedSections` follows the nav menu's order (services + advisory
         * are grouped under one dropdown), not the page's actual top-to-bottom
         * order — Advisory renders after Packages in the DOM. The scan below
         * picks the last entry whose top crossed the threshold, so it must
         * walk the sections in document order or it picks whichever tracked
         * id happens to come last in the menu instead of whichever is
         * physically closest above the fold.
         */
        .sort((a, b) => a.top - b.top)
    }

    const update = () => {
      frame = 0

      const scrollY = window.scrollY
      setIsScrolled(scrollY > 16)

      // Last section whose top has crossed the header wins; null above them all.
      let current: string | null = null

      for (const { id, top } of offsets) {
        if (top - scrollY <= ACTIVE_OFFSET) {
          current = id
        }
      }

      /*
       * The last tracked section (FAQ) is followed by FinalCta, which isn't
       * itself tracked. If FinalCta is shorter than a viewport, the page runs
       * out of scroll room before FAQ's top ever comes within ACTIVE_OFFSET of
       * the header, so the loop above never selects it and the nav is stuck on
       * whichever section came before — at the actual bottom of the page, the
       * last tracked section is unambiguously the current one regardless of
       * where its top sits.
       */
      const atBottom =
        scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      if (atBottom && offsets.length > 0) {
        current = offsets[offsets.length - 1].id
      }

      setActiveId(current)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    /*
     * Sections change height on resize (and as fonts and images settle), so
     * the cache is rebuilt there rather than assumed to hold for the visit.
     */
    const onResize = () => {
      measure()
      onScroll()
    }

    measure()
    update()

    /*
     * Late-loading images and webfonts move every section below them, and a
     * cache taken before they land would point at stale offsets for the rest
     * of the visit. `ResizeObserver` on the document element catches exactly
     * that without polling.
     */
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            measure()
          })

    resizeObserver?.observe(document.documentElement)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])


  /*
   * The open mobile panel owns the screen: it locks scrolling, takes focus,
   * keeps Tab inside itself, and hands focus back to the toggle on close.
   *
   * Without the trap, Tab walked straight out of the panel and into the page
   * behind it — which is scroll-locked and visually covered, so a keyboard or
   * screen-reader user was navigating content they could neither see nor
   * scroll to (WCAG 2.4.3 / 2.1.2). The dropdown effect above already returns
   * focus to its trigger; this mirrors that contract for the panel.
   *
   * The lock is reference-counted because the intro curtain holds one too —
   * see `lockScroll`.
   */
  useEffect(() => {
    if (!isMenuOpen) return

    const panel = document.getElementById(menuId)
    const toggle = menuToggleRef.current

    /*
     * The whole header is the boundary, not just the panel.
     *
     * While the panel is open the bar above it stays visible and interactive —
     * it holds the logo, the "Agendar" CTA, the language switcher and the
     * close button — so those are legitimately part of the open dialog. Scoping
     * the trap to `#menuId` alone made the panel's last link look like the end
     * of the list, and Tab fell straight through the header's own controls into
     * the page behind, thousands of pixels down.
     */
    const header = toggle?.closest('header')

    const focusables = () =>
      Array.from(
        header?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(
        (element) =>
          element.offsetParent !== null && !element.closest('[inert]'),
      )

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const items = focusables()
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement

      /*
       * Compared by index rather than by identity against the two edges: focus
       * can sit on something that is inside the header but is neither edge (or
       * on nothing at all, after a click on the backdrop), and in those cases
       * an identity check silently lets Tab out. Anything not currently in the
       * list is pulled back to the matching edge.
       */
      const index = items.indexOf(current as HTMLElement)

      if (event.shiftKey) {
        if (index <= 0) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (index === -1 || index === items.length - 1) {
        event.preventDefault()
        first.focus()
      }
    }

    lockScroll()
    // The panel's own first link, not the header's — that is where the
    // visitor's attention just went.
    panel
      ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
      ?.focus()
    window.addEventListener('keydown', onKeyDown)

    return () => {
      unlockScroll()
      window.removeEventListener('keydown', onKeyDown)
      toggle?.focus()
    }
  }, [isMenuOpen, menuId])

  return (
    /*
      Scrolled state is a translucent blurred bar rather than an opaque one.
      An opaque bar dropping in is a hard visual event — a rectangle appearing
      over the content; a frosted one keeps the page continuous underneath,
      which is the treatment every well-made site of this kind uses and the
      single cheapest upgrade to how "finished" a page feels while scrolling.

      The mobile panel is the exception: while it is open the bar must be
      fully opaque, because the nav links sit over whatever content the panel
      covers and a blur is not enough to keep them legible.
    */
    <header
      className={cn(
        /*
           `backdrop-filter` is deliberately NOT in the transition list, and it
           is now set unconditionally rather than toggled on at the scroll
           threshold. Animating it makes the compositor re-run the blur over
           everything behind the header on every frame of the 300ms
           transition, and it used to fire on the first scroll — exactly when
           the browser is already busiest. Only the colour and shadow
           cross-fade, which is all the eye reads.
        */
        /*
           No `contain: paint` here, deliberately. It would confine the bar's
           repaints to its own box — worthwhile next to a `backdrop-filter` —
           but the mobile panel is a child that expands past the bar's own
           height and would be clipped out of existence. Containment belongs on
           a box nothing escapes.
        */
        /*
           The bar carries a dark surface from the first frame.

           It used to be `bg-transparent` at rest and only take a background
           once the page had scrolled. Over the hero's new artwork that left
           the nav floating on whatever the backdrop happened to be painting
           under it — the bright arc sweeps through the top-right, which is
           exactly where the CTA and the locale switcher sit — so the controls
           had no consistent ground and the bar did not read as a bar until the
           visitor scrolled.

           Scroll still changes the treatment, just not from nothing: the
           resting state is a lighter veil with no shadow, and scrolling
           deepens it and adds the separator, so the bar still lifts off the
           page as content passes under it.
        */
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300',
        'backdrop-blur-xl backdrop-saturate-150',
        isMenuOpen && 'bg-[var(--surface-base)]',
        !isMenuOpen &&
          isScrolled &&
          'bg-[color-mix(in_srgb,var(--surface-base)_82%,transparent)] shadow-[0_1px_0_var(--surface-border),var(--shadow-mid)]',
        !isMenuOpen &&
          !isScrolled &&
          'bg-[color-mix(in_srgb,var(--surface-base)_62%,transparent)]',
      )}
    >
      <a
        href="#contenido"
        /* White on the accent — near-black on mid-violet does not clear
           4.5:1, and this is the one control a keyboard user meets first. */
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-10 focus-visible:rounded-lg focus-visible:bg-[var(--color-acento)] focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-white focus-visible:shadow-[var(--shadow-high)]"
      >
        {t('skipToContent')}
      </a>

      {/* Matches the hero's `2xl` container so the logo and the hero headline
          share a left edge on wide monitors, where the fixed 80rem cap left a
          visible gap down the left side. */}
      {/*
        `--header-bar` is the bar's own height; the padding above it is the
        device's top inset, so on a notched phone the controls sit below the
        status bar instead of under it. The painted surface still starts at
        y=0, which is what keeps the blur running edge to edge.
      */}
      <div className="mx-auto flex h-[var(--header-bar)] max-w-[80rem] items-center justify-between gap-6 px-5 pt-[env(safe-area-inset-top,0px)] box-content sm:px-8 2xl:max-w-[132rem] 2xl:px-[clamp(5rem,7.5vw,11rem)]">
        <Logo label={t('home')} />

        <nav ref={navRef} aria-label={t('mainNav')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeId === item.id

              return (
                <li key={item.key}>
                  <a
                    href={sectionHref(item.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'relative flex min-h-11 items-center rounded-md px-3 text-sm transition-colors duration-200',
                      isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {t(item.key)}
                    {/* Marks where the visitor is without moving anything. */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-x-3 bottom-2 h-px origin-left bg-[var(--color-acento)] transition-transform duration-300 ease-out',
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
          {/*
            Visible at every size, including phones.

            It used to be `md:inline-flex` — hidden on phones, where the only
            way to act was to open the hamburger and find a link inside it.
            Every design-led marketing site measured for this (Linear, Mercury,
            Cursor, Clerk) keeps a CTA in the mobile header instead, and none
            of the twelve surveyed used a fixed bottom bar. So the header
            carries it.

            Two forms, one element. On a phone it is a filled accent button
            with a short label — the full "Agendar llamada estratégica" does
            not fit beside a logo and a menu button at 56px, so the phone
            shows `buttons.book` and the assistive name stays the full string
            via `aria-label`. From `md` up there is room for the full label,
            and it reverts to the quieter bordered pill so it does not compete
            with the hero's own CTA on the first screen.
          */}
          <a
            href={sectionHref(sectionIds.finalCta)}
            aria-label={tHero('cta')}
            className={cn(
              'group inline-flex min-h-11 items-center gap-1.5 rounded-[0.5rem] px-3 text-[0.8125rem] font-semibold transition-colors duration-200',
              'btn-volume md:min-h-11 md:px-3.5 md:text-sm md:font-medium',
              // From `md`: drop the filled treatment for the bordered pill.
              'md:border md:border-hairline md:bg-none md:text-ink md:shadow-none',
              'md:hover:border-[var(--accent-hairline)] md:hover:bg-[var(--accent-soft)]',
            )}
          >
            <span className="md:hidden">{t('bookShort')}</span>
            <span className="hidden md:inline">{tHero('cta')}</span>
            <ArrowRight
              aria-hidden
              className="h-4 w-4 shrink-0 transition-transform duration-200 ease-[var(--ease-emphasis)] group-hover:translate-x-1 md:text-[var(--accent-text)]"
            />
          </a>

          <button
            ref={menuToggleRef}
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[0.5rem] border border-hairline bg-[var(--surface-panel)] text-ink shadow-[var(--shadow-low)] transition-colors duration-200 hover:border-hairline-strong hover:bg-[var(--surface-inset)] lg:hidden"
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
        The panel animates its own max-height, not a grid track.

        It used to be a `grid` going from `grid-rows-[0fr]` to `[1fr]`, which
        is the usual trick for animating to auto height. It did not collapse:
        measured on an iPhone viewport the closed panel still resolved its
        track to `56px` and reported a 57px box, so the fixed header was 113px
        tall while `--header-height` said 56px — and the hero, which reserves
        its top padding from that token, started its headline 21px *underneath*
        the bar. The first line of the h1 was clipped on every phone.

        `max-h-0` has no such failure mode: zero is zero. The open value is a
        ceiling comfortably above the panel's real height (four links plus the
        CTA block), so the content decides the height and this only bounds the
        transition. It stays in the DOM either way, so `inert` is what removes
        the collapsed links from tab order and from assistive technology.
      */}
      <div
        className={cn(
          'overflow-hidden transition-[max-height] duration-300 ease-[var(--ease-emphasis)] lg:hidden',
          /* `border-t` only while open. Kept as a border at all times it cost
             a permanent 1px of header height even when collapsed, which is the
             same class of bug as the grid track above. */
          isMenuOpen ? 'max-h-[32rem] border-t border-hairline' : 'max-h-0',
          /* Opaque only while open — closed, the collapsed panel must not
             paint a band under the bar's own blurred surface. */
          isMenuOpen ? 'bg-[var(--surface-base)]' : 'bg-transparent',
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
                  className="flex min-h-12 items-center rounded-lg px-3 text-[1.0625rem] text-ink-muted transition-colors duration-200 hover:bg-[var(--accent-soft)] hover:text-ink"
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>

          {/*
            The panel's CTA is a real filled button, separated from the
            destinations by a hairline. As a text link at the same size as the
            nav items it was the fifth thing in a list of five and the one
            action in the menu had no visual priority at all.
          */}
          <div className="mt-6 flex flex-col gap-4 border-t border-hairline-subtle pt-6">
            <Button asChild size="lg" block>
              <a
                href={sectionHref(sectionIds.finalCta)}
                onClick={() => setIsMenuOpen(false)}
                className="group/cta"
              >
                {tHero('cta')}
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 transition-transform duration-200 ease-[var(--ease-emphasis)] group-hover/cta:translate-x-1"
                />
              </a>
            </Button>
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
