/**
 * Browser-side client for the hero's booking widget. Talks only to this
 * app's own `/api/booking/*` routes (same-origin, so no CORS involved) —
 * those routes are what actually reaches the Render booking service.
 */
import type { ApiResponse } from '@/lib/api'

import { SlotUnavailableError, type AvailabilitySlot, type BookingConfirmation } from './booking-types'

export { SlotUnavailableError }
export type { AvailabilitySlot, BookingConfirmation }

export interface BookingRequest {
  /** ISO 8601 start of the chosen slot. */
  start: string
  name: string
  whatsapp: string
  /** Required so the backend's reminder job has somewhere to send the 24h/1h reminder. */
  email: string
  /** Pass-through context — set when the panel was opened from the long qualification form. */
  notes?: string
}

export async function getAvailability(day: string): Promise<AvailabilitySlot[]> {
  const response = await fetch(`/api/booking/availability?day=${day}`, { cache: 'no-store' })
  const result = (await response.json()) as ApiResponse<{ slots: AvailabilitySlot[] }>

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? 'request_failed')
  }

  return result.data?.slots ?? []
}

export async function bookSlot(payload: BookingRequest): Promise<BookingConfirmation> {
  const response = await fetch('/api/booking/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const result = (await response.json()) as ApiResponse<BookingConfirmation>

  if (response.status === 409) {
    throw new SlotUnavailableError(result.error ?? 'slot_unavailable')
  }

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error ?? 'request_failed')
  }

  return result.data
}
