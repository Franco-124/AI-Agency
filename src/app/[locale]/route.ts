import { isLocale } from '@/i18n/routing'

import { stitchHomeHtml } from './stitch-home'

// Cortana web-chat API (browser calls it directly; its CORS allow-list must
// include this site's origin).
const CHAT_API_URL = (process.env.NEXT_PUBLIC_CHAT_API_URL ?? 'https://numi-agent-backend-production.up.railway.app').replace(/\/+$/, '')

/**
 * Home page served as the Stitch "Rediseño Web Numinet" export, verbatim, so
 * it renders exactly like the design. The previous React home lives in
 * `_legacy-page.tsx.bak`. Buttons scroll to `#contacto`; the form posts to
 * `/api/contact` and hands off to `/[locale]/agendar` to book the call.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return new Response('Not found', { status: 404 })
  }

  const html = stitchHomeHtml[locale]
    .replaceAll('__LOCALE__', locale)
    .replaceAll('__CHAT_API_URL__', CHAT_API_URL)
    .replaceAll('__YEAR__', String(new Date().getFullYear()))

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
