import type { Lead } from '@/lib/schemas'

/**
 * Carries what the long qualification form (`LeadForm`) already collected to
 * the dedicated `/agendar` page, so the visitor books their call on that full
 * page instead of a panel squeezed into the form's own card. The same data
 * also backs the no-availability fallback email (see `BookingPageClient`) —
 * one stored shape for both, rather than a flattened `notes` string that would
 * have to be re-parsed to email the team.
 *
 * Session storage rather than a query string: `message` is free text that can
 * run long, and none of it needs to survive in browser history or a shared
 * URL. Same pattern as `package-interest.ts` / `advisory-interest.ts` — read
 * once on the destination page's mount, then forgotten.
 */
const STORAGE_KEY = 'numi:booking-handoff'

export type BookingHandoff = Lead

function isBookingHandoff(value: unknown): value is BookingHandoff {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).name === 'string' &&
    typeof (value as Record<string, unknown>).industry === 'string' &&
    typeof (value as Record<string, unknown>).interest === 'string' &&
    typeof (value as Record<string, unknown>).whatsapp === 'string' &&
    typeof (value as Record<string, unknown>).email === 'string'
  )
}

export function rememberBookingHandoff(data: BookingHandoff): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Private mode or a blocked storage API — the visitor just re-types on /agendar.
  }
}

export function readBookingHandoff(): BookingHandoff | undefined {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return undefined

    const parsed: unknown = JSON.parse(stored)
    return isBookingHandoff(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

export function forgetBookingHandoff(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
