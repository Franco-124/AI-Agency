import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { ApiResponse } from '@/lib/api'
import { notifyTeamOfLead } from '@/lib/leads/notify'
import { clientKey, isRateLimited } from '@/lib/rate-limit'
import { leadSchema } from '@/lib/schemas'

/**
 * The lead's own fields plus why self-service booking failed, which decides
 * the subject line — the team needs to tell "book it yourself" leads apart
 * from ones that need a person to reach out.
 */
const notifySchema = leadSchema.extend({
  fallbackReason: z.enum(['no_availability', 'service_failed']).optional(),
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RATE_LIMIT = { bucket: 'contact:notify', limit: 5, windowMs: 10 * 60 * 1000 }

/**
 * Fallback notification for a lead that already went through `/api/contact`
 * (so the row is saved) but reached the calendar and found nothing bookable
 * within `MAX_LOOKAHEAD_DAYS` — see `BookingCalendarPanel`'s `onNoAvailability`.
 * The team gets an email instead of the lead being left to book itself, since
 * self-service booking is not possible when the calendar has no open slot.
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

  const parsed = notifySchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'validation_failed' },
      { status: 422 },
    )
  }

  const { fallbackReason, ...lead } = parsed.data

  try {
    await notifyTeamOfLead(lead, fallbackReason)
  } catch (error) {
    console.error('[lead] no-availability notification failed', error)

    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'delivery_failed' },
      { status: 502 },
    )
  }

  return NextResponse.json<ApiResponse<null>>({ success: true, data: null }, { status: 200 })
}
