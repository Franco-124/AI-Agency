import { siteConfig } from '@/lib/site'

// Plain Response instead of the `MetadataRoute.Robots` metadata API: that
// typed API has no field for Content Signals (https://contentsignals.org/),
// which declare AI usage preferences (training, search, input) separately
// from crawl access — a plain text body is the only way to emit it.
/*
 * Crawlers that fetch a page in order to ANSWER a question and cite the source
 * back to the user. These send referral traffic and are how the business gets
 * recommended inside ChatGPT, Claude, Perplexity and Google's AI surfaces, so
 * they are named explicitly rather than left to the wildcard.
 *
 * Naming them matters even though `User-agent: *` already allows everything:
 * an explicit group is unambiguous, survives any future tightening of the
 * wildcard, and is the only signal most of these bots actually parse today —
 * `Content-Signal` below is a young convention with thin adoption.
 *
 * Training-only crawlers (GPTBot, ClaudeBot, anthropic-ai, CCBot,
 * Google-Extended, Applebot-Extended, meta-externalagent, Bytespider) are
 * deliberately NOT listed. They inherit the wildcard's `Allow: /`, and the
 * `ai-train=no` content signal states the preference — the site is readable,
 * but asks not to be used as training data.
 */
const ANSWER_ENGINE_CRAWLERS = [
  'OAI-SearchBot', // ChatGPT Search index
  'ChatGPT-User', // ChatGPT browsing on a user's behalf
  'Claude-SearchBot', // Claude search index
  'Claude-User', // Claude browsing on a user's behalf
  'PerplexityBot', // Perplexity index
  'Perplexity-User', // Perplexity fetching a cited page
  'Google-CloudVertexBot',
  'DuckAssistBot',
]

export async function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    // Explicitly welcome the crawlers that cite sources back to a reader.
    ...ANSWER_ENGINE_CRAWLERS.flatMap((agent) => [
      `User-agent: ${agent}`,
      'Allow: /',
      'Disallow: /api/',
      '',
    ]),
    // ai-train=no: don't train on this content. search=yes / ai-input=yes:
    // still fine to index and to quote/cite in answers (RAG, chat replies).
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    '',
    // Plain-text business summary for LLM consumption. Not a standard robots
    // directive, so it is a comment — the convention is that agents look for
    // /llms.txt directly, and this only signposts it for anyone reading here.
    `# LLM summary: ${siteConfig.url}/llms.txt`,
    '',
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
