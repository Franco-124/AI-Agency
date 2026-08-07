/**
 * Server-side environment access.
 *
 * Reads are deliberately lazy (called from inside request handlers, never at
 * module scope) so a missing variable fails the request with a clear message
 * instead of breaking the build or the whole route bundle.
 */
export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}
