import { siteConfig } from '@/lib/site'

// Plain Response instead of the `MetadataRoute.Robots` metadata API: that
// typed API has no field for Content Signals (https://contentsignals.org/),
// which declare AI usage preferences (training, search, input) separately
// from crawl access — a plain text body is the only way to emit it.
export async function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    // ai-train=no: don't train on this content. search=yes / ai-input=yes:
    // still fine to index and to quote/cite in answers (RAG, chat replies).
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    '',
    `Host: ${siteConfig.url}`,
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
