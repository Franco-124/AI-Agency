import { NextResponse } from 'next/server'

import type { ApiResponse } from '@/lib/api'
import { bookSlot, SlotUnavailableError, type BookingConfirmation } from '@/lib/calendar-api'
import { clientKey, isRateLimited } from '@/lib/rate-limit'
import { bookingRequestSchema } from '@/lib/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 }

/**
 * Proxies the booking service's booking endpoint, for the same CORS reason
 * as `/api/booking/availability`. Validation is re-run server side because
 * client validation is a UX aid, not a security boundary.
 */
export async function POST(request: Request) {
  if (isRateLimited(clientKey(request), RATE_LIMIT)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'rate_limited' },
      { status: 429 },
    )
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'invalid_json' },
      { status: 400 },
    )
  }

  const parsed = bookingRequestSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'validation_failed' },
      { status: 422 },
    )
  }

  try {
    const confirmation = await bookSlot({
      start: parsed.data.start,
      contactName: parsed.data.name,
      contactPhone: parsed.data.whatsapp,
      contactEmail: parsed.data.email,
      notes: parsed.data.notes,
    })

    return NextResponse.json<ApiResponse<BookingConfirmation>>(
      { success: true, data: confirmation },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'slot_unavailable' },
        { status: 409 },
      )
    }

    console.error('[booking] submission failed', error)

    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'upstream_failed' },
      { status: 502 },
    )
  }
}
