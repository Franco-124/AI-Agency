import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Markdown content negotiation for AI agents/crawlers: a request for a
// locale home page with `Accept: text/markdown` is rewritten to the
// markdown route instead of the rendered HTML page. Runs before the i18n
// middleware so it never interferes with locale detection/redirects for
// normal browser requests, which never send this Accept header.
const LOCALE_HOME_PATTERN = /^\/(es|en)\/?$/

export default function proxy(request: NextRequest) {
  const accept = request.headers.get('accept') ?? ''

  if (accept.includes('text/markdown') && LOCALE_HOME_PATTERN.test(request.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL('/markdown', request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  // Run on every path except API routes, Next.js internals and static files.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
