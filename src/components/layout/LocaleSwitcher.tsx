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

  const switchTo = (locale: Locale) => {
    if (locale === active) return
    startTransition(() => {
      router.replace(pathname, { locale })
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
