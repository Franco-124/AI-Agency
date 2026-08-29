/**
 * Server-side client for the Numi AI booking service (FastAPI on Render).
 * Used only by the `/api/booking/*` route handlers — never imported from a
 * Client Component.
 *
 * The booking service sends no CORS headers (confirmed against the live
 * service), so a browser cannot call it directly; these routes exist purely
 * to proxy the request server-to-server, where CORS does not apply.
 */
import { requiredEnv } from '@/lib/env'

import {
  SlotUnavailableError,
  type AvailabilitySlot,
  type BookingConfirmation,
} from './booking-types'

export { SlotUnavailableError }
export type { AvailabilitySlot, BookingConfirmation }

export interface BookingPayload {
  /** ISO 8601 start of the chosen slot — sent as a flat field, no wrapper. */
  start: string
  contactName: string
  contactPhone?: string
  contactEmail?: string
  notes?: string
}

/**
 * Fixed today because Numi AI itself is the only active tenant. Once a
 * client dashboard exists this stops being a constant and starts coming from
 * each client's session/context.
 */
const NUMI_CLIENT_ID = 'numi-ai'

/**
 * The service runs on Render's free tier, which cold-starts, so these are
 * generous rather than tight — but bounded, because without a deadline a
 * hung upstream would hold the route handler open until the platform's own
 * much longer timeout, with the visitor watching a spinner the whole time.
 * Booking gets the longer budget: it writes to Google Calendar.
 */
const AVAILABILITY_TIMEOUT_MS = 15_000
const BOOKING_TIMEOUT_MS = 25_000

/**
 * The service answers failures with FastAPI's `{"detail": "..."}`, and that
 * detail is the only thing that says *why* — without it a 502 here is
 * indistinguishable from a 502 caused by anything else, which is exactly the
 * dead end this exists to avoid. Truncated, and never surfaced to the
 * visitor: it goes to the server log only.
 */
async function describeFailure(response: Response): Promise<string> {
  try {
    const body = await response.text()
    if (!body) return `${response.status}`

    const detail = (JSON.parse(body) as { detail?: unknown }).detail

    return `${response.status}: ${typeof detail === 'string' ? detail : body.slice(0, 300)}`
  } catch {
    // Not JSON, or the body could not be read — the status still tells us something.
    return `${response.status}`
  }
}

export async function getAvailability(day: string): Promise<AvailabilitySlot[]> {
  const response = await fetch(
    `${requiredEnv('CALENDAR_API_BASE_URL')}/calendar/${NUMI_CLIENT_ID}/availability?day=${day}`,
    {
      cache: 'no-store', // availability must never be served from a cache
      signal: AbortSignal.timeout(AVAILABILITY_TIMEOUT_MS),
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch availability (${await describeFailure(response)})`)
  }

  const data = await response.json()
  return data.slots as AvailabilitySlot[]
}

export async function bookSlot(payload: BookingPayload): Promise<BookingConfirmation> {
  const response = await fetch(
    `${requiredEnv('CALENDAR_API_BASE_URL')}/calendar/${NUMI_CLIENT_ID}/book`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: payload.start,
        contact_name: payload.contactName,
        contact_phone: payload.contactPhone,
        contact_email: payload.contactEmail,
        notes: payload.notes,
      }),
      signal: AbortSignal.timeout(BOOKING_TIMEOUT_MS),
    },
  )

  // Confirmed against the service's source: `SlotUnavailableError` is
  // translated to 409 in its `_domain_errors` handler. Undeclared in its
  // `/openapi.json`, which lists only 201 and 422 — the status is real, the
  // spec is just incomplete.
  if (response.status === 409) {
    throw new SlotUnavailableError('That slot is no longer available.')
  }

  if (!response.ok) {
    throw new Error(`Failed to book the slot (${await describeFailure(response)})`)
  }

  const data = await response.json()
  return {
    appointmentId: data.appointment_id,
    eventId: data.event_id,
    start: data.start,
    end: data.end,
    timezone: data.timezone,
  }
}
