/**
 * Minimal in-memory fixed-window limiter for the lead endpoint.
 *
 * It is a deterrent, not a guarantee: state lives in the function instance, so
 * it only limits per running instance. That is enough to stop a single visitor
 * hammering the form (and burning Resend quota) without adding infrastructure.
 */
type Window = { count: number; resetAt: number }

const windows = new Map<string, Window>()

/** Keeps the map from growing unbounded on long-lived instances. */
function evictExpired(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) {
      windows.delete(key)
    }
  }
}

export function isRateLimited(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): boolean {
  // Never throttle local development: the in-memory window survives across
  // every manual test submitted against the same dev server, so a handful of
  // clicks while testing a form trips the same limiter meant for a real
  // visitor abusing the endpoint. Production keeps the real check.
  if (process.env.NODE_ENV !== 'production') {
    return false
  }

  const now = Date.now()
  const current = windows.get(key)

  if (!current || current.resetAt <= now) {
    evictExpired(now)
    windows.set(key, { count: 1, resetAt: now + windowMs })

    return false
  }

  if (current.count >= limit) {
    return true
  }

  windows.set(key, { count: current.count + 1, resetAt: current.resetAt })

  return false
}

/** Best-effort client identity behind Vercel's proxy. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')

  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}
