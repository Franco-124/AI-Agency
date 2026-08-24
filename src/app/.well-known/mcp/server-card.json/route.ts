import { siteConfig } from '@/lib/site'

// Numi AI does not run an MCP server. This card is a declarative capability
// manifest: it tells agents there is no tool/resource server here, and
// points them to the human-readable/machine-readable content that does
// exist (llms.txt, JSON-LD on the home page) instead of a 404 dead end.
export async function GET() {
  const body = {
    name: 'numi-ai',
    version: '1.0.0',
    description:
      'Numi AI is a marketing website for an AI agency in Colombia. No MCP tools or resources are exposed; business information is available via llms.txt and JSON-LD structured data.',
    mcpServer: false,
    contentEndpoints: {
      llmsTxt: `${siteConfig.url}/llms.txt`,
      sitemap: `${siteConfig.url}/sitemap.xml`,
    },
  }

  return Response.json(body, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
