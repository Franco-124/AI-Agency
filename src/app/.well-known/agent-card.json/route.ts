import { siteConfig } from '@/lib/site'

// A2A (Agent-to-Agent protocol) agent card. Numi AI is not itself an A2A
// agent — this card declares that explicitly so agent crawlers stop probing
// and fall back to the content-only discovery paths (llms.txt, JSON-LD).
export async function GET() {
  const body = {
    name: 'Numi AI',
    description:
      'AI agency for small and medium businesses in Colombia. This is a marketing website, not an A2A-compliant agent — it exposes no A2A skills or tasks.',
    url: siteConfig.url,
    provider: {
      organization: siteConfig.name,
      url: siteConfig.url,
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    skills: [],
  }

  return Response.json(body, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
