'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useLocale } from 'next-intl'
import { CO, US } from 'country-flag-icons/react/3x2'
import { useEffect, useRef, useState, useTransition } from 'react'

import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type LocaleSwitcherProps = {
  label: string
  className?: string
}

const localeMeta: Record<Locale, { name: string; Flag: typeof CO }> = {
  es: { name: 'Español', Flag: CO },
  en: { name: 'English', Flag: US },
}

export function LocaleSwitcher({ label, className }: LocaleSwitcherProps) {
  const active = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const ActiveFlag = localeMeta[active].Flag

  /*
   * Switching language must not move the visitor: they are re-reading the page
   * they are already on, not navigating to a new one.
   *
   * `scroll: false` is what guarantees that. Without it Next applies its
   * route-change scroll reset, which walks forward through the segment's
   * siblings skipping fixed/sticky and zero-size elements (`ScrollProgress`,
   * `Header` and the JSON-LD `<script>` are all skipped) and calls
   * `scrollIntoView()` on the first one it keeps — landing somewhere the
   * visitor never asked to go.
   *
   * The hash is carried over by hand because next-intl's `usePathname()`
   * returns the pathname only, so `/es#paquetes` would otherwise become a bare
   * `/en` and lose the section the visitor was reading.
   */
  const switchTo = (locale: Locale) => {
    setIsOpen(false)
    if (locale === active) return

    const { hash } = window.location

    startTransition(() => {
      router.replace(`${pathname}${hash}`, { locale, scroll: false })
    })
  }

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-xs font-medium text-ink transition-colors duration-200 hover:border-hairline-strong',
          isPending && 'opacity-60',
        )}
      >
        <ActiveFlag
          aria-hidden
          className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
        />
        <span className="uppercase tracking-widest">{active}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <ul
        role="listbox"
        aria-label={label}
        className={cn(
          'absolute inset-x-0 top-[calc(100%+0.5rem)] z-10 origin-top overflow-hidden rounded-lg border border-hairline bg-[var(--color-neutro-oscuro)] shadow-lg transition-all duration-150 ease-out sm:inset-x-auto sm:right-0 sm:min-w-[9.5rem]',
          isOpen
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        )}
      >
        {locales.map((locale) => {
          const { name, Flag } = localeMeta[locale]
          const isActive = locale === active

          return (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                lang={locale}
                onClick={() => switchTo(locale)}
                className={cn(
                  'flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--color-acento)]/10 text-ink'
                    : 'text-ink-muted hover:bg-white/5 hover:text-ink',
                )}
              >
                <Flag aria-hidden className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover" />
                <span className="flex-1 whitespace-nowrap text-left">{name}</span>
                {isActive && (
                  <Check aria-hidden className="h-3.5 w-3.5 shrink-0 text-[var(--color-acento)]" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
