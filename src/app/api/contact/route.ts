import { NextResponse } from 'next/server'

import type { ApiResponse } from '@/lib/api'
import { leadSchema } from '@/lib/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type LeadAccepted = { receivedAt: string }

/**
 * Lead intake endpoint for the landing's single contact form.
 *
 * Validation is re-run server side because client validation is a UX aid, not a
 * security boundary. Personal data is never echoed back in the response.
 *
 * TODO: connect the delivery channel before launch (Resend / n8n / CRM).
 * Set LEAD_WEBHOOK_URL and forward the validated payload from here.
 */
export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'invalid_json' },
      { status: 400 },
    )
  }

  const parsed = leadSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'validation_failed' },
      { status: 422 },
    )
  }

  const lead = parsed.data
  const receivedAt = new Date().toISOString()

  try {
    // Structured, non-identifying log so deliverability can be monitored
    // without leaking the lead's personal data into the platform logs.
    console.info('[lead] received', {
      messageLength: lead.message.length,
      receivedAt,
    })

    return NextResponse.json<ApiResponse<LeadAccepted>>(
      { success: true, data: { receivedAt } },
      { status: 201 },
    )
  } catch (error) {
    console.error('[lead] delivery failed', error)

    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'delivery_failed' },
      { status: 502 },
    )
  }
}
