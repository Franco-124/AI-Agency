import { notFound } from 'next/navigation'

/*
  Catch-all for any unmatched path under a valid `/[locale]/*` prefix (e.g.
  `/es/no-existe`). Without a matched page here, Next never renders the
  `[locale]` segment tree for such a request and falls straight to the
  generic root 404 instead of the localized `[locale]/not-found.tsx` — this
  file's only job is to give the router something to match so that boundary
  applies.
*/
export default function CatchAll() {
  notFound()
}
