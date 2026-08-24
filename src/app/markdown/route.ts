import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Backing route for the markdown-negotiation rewrite in middleware.ts.
// Serves the same business summary as /llms.txt so AI agents requesting
// `Accept: text/markdown` get plain text instead of the rendered HTML page.
export async function GET() {
  const llmsTxtPath = path.join(process.cwd(), 'public', 'llms.txt')
  const markdown = await readFile(llmsTxtPath, 'utf-8')

  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
