import type { MetadataRoute } from 'next'

import { defaultLocale, locales } from '@/i18n/routing'
import { siteConfig } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '', changeFrequency: 'monthly' as const, priority: 1 },
    { path: '/privacidad', changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: locale === 'es' ? route.priority : route.priority * 0.8,
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((item) => [item, `${siteConfig.url}/${item}${route.path}`]),
          ),
          'x-default': `${siteConfig.url}/${defaultLocale}${route.path}`,
        },
      },
    })),
  )
}
