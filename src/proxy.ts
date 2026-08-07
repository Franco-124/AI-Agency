import createMiddleware from 'next-intl/middleware'

import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Run on every path except API routes, Next.js internals and static files.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
