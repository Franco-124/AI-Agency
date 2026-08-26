import { defineRouting } from 'next-intl/routing'

export const locales = ['es', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'es'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Always land on the default locale instead of guessing from the
  // browser's Accept-Language header — the site's audience is Spanish-
  // speaking regardless of visitors' device/browser language settings.
  localeDetection: false,
})

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale)
