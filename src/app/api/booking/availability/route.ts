import { NextResponse } from 'next/server'

import type { ApiResponse } from '@/lib/api'
import { getAvailability, type AvailabilitySlot } from '@/lib/calendar-api'
import { clientKey, isRateLimited } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RATE_LIMIT = { bucket: 'booking:availability', limit: 30, windowMs: 10 * 60 * 1000 }
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Proxies the booking service's availability endpoint. The service sends no
 * CORS headers, so the hero widget cannot call it directly from the browser
 * — this same-origin route stands in for it.
 */
export async function GET(request: Request) {
  if (isRateLimited(clientKey(request), RATE_LIMIT)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'rate_limited' },
      { status: 429 },
    )
  }

  const day = new URL(request.url).searchParams.get('day')

  if (!day || !DAY_PATTERN.test(day)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'invalid_day' },
      { status: 400 },
    )
  }

  try {
    const slots = await getAvailability(day)

    return NextResponse.json<ApiResponse<{ slots: AvailabilitySlot[] }>>(
      { success: true, data: { slots } },
      { status: 200 },
    )
  } catch (error) {
    console.error('[booking] availability fetch failed', error)

    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'upstream_failed' },
      { status: 502 },
    )
  }
}
