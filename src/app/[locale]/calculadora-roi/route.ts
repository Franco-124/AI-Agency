import { isLocale } from '@/i18n/routing'

import { stitchRoiHtml } from '../stitch-roi'

/**
 * ROI calculator served as the Stitch "Calculadora de ROI" export, verbatim,
 * the same way the home page is — see `[locale]/route.ts`. The simulator's own
 * client script ships inside the export; the lead form posts to `/api/contact`
 * and hands off to `/[locale]/agendar` to book the call.
 *
 * Regenerate with `node scripts/build-stitch-roi.mjs` after editing
 * `design/stitch/roi.html` or `scripts/stitch-roi-en.json`.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return new Response('Not found', { status: 404 })
  }

  const html = stitchRoiHtml[locale]
    .replaceAll('__LOCALE__', locale)
    .replaceAll('__YEAR__', String(new Date().getFullYear()))

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
