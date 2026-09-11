import type { MetadataRoute } from 'next'

import { defaultLocale, locales } from '@/i18n/routing'
import { siteConfig } from '@/lib/site'

/**
 * Build date, stamped once per deploy.
 *
 * The sitemap previously carried no `lastModified` at all, which leaves a
 * crawler with nothing to compare against and no reason to recrawl. Resolving
 * it at module scope means every entry in one build shares a single timestamp —
 * the moment the site was built — rather than the time each request happened to
 * hit, which would make every fetch look like a fresh change and train crawlers
 * to ignore the field.
 */
const lastModified = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '', changeFrequency: 'monthly' as const, priority: 1 },
    { path: '/agendar', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/privacidad', changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${route.path}`,
      lastModified,
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
