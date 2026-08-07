'use client'

import { useLocale } from 'next-intl'
import { useTransition } from 'react'

import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type LocaleSwitcherProps = {
  label: string
  className?: string
}

export function LocaleSwitcher({ label, className }: LocaleSwitcherProps) {
  const active = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

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
    if (locale === active) return

    const { hash } = window.location

    startTransition(() => {
      router.replace(`${pathname}${hash}`, { locale, scroll: false })
    })
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex items-center rounded-lg border border-hairline p-0.5',
        isPending && 'opacity-60',
        className,
      )}
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-current={locale === active ? 'true' : undefined}
          onClick={() => switchTo(locale)}
          className={cn(
            'rounded-[0.4rem] px-2.5 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors duration-200',
            locale === active
              ? 'bg-[var(--color-acento)] text-[var(--color-neutro-oscuro)]'
              : 'text-ink-faint hover:text-ink',
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  )
}
