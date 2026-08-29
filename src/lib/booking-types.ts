/**
 * Shapes shared by the booking service's server-side client
 * (`lib/calendar-api.ts`) and its browser-side counterpart
 * (`lib/calendar-client.ts`). Kept in their own module so neither side has to
 * import the other — the server module reaches the real FastAPI service, the
 * browser module only ever talks to this app's own `/api/booking/*` routes.
 */

export interface AvailabilitySlot {
  /** ISO 8601, already in the tenant's timezone (America/Bogota). */
  start: string
  end: string
  /** Pre-formatted by the backend (e.g. "09:00") — do not reformat on the client. */
  label: string
}

export interface BookingConfirmation {
  appointmentId: string
  eventId: string
  start: string
  end: string
  timezone: string
}

export class SlotUnavailableError extends Error {}
