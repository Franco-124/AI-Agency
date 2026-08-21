import { NextResponse } from 'next/server'

import type { ApiResponse } from '@/lib/api'
import { notifyTeamOfLead } from '@/lib/leads/notify'
import { saveLead } from '@/lib/leads/store'
import { clientKey, isRateLimited } from '@/lib/rate-limit'
import { leadSchema } from '@/lib/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type LeadAccepted = { receivedAt: string }

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 }

/**
 * Lead intake endpoint for the landing's single contact form.
 *
 * Validation is re-run server side because client validation is a UX aid, not a
 * security boundary. Personal data is never echoed back in the response.
 *
 * Order matters: the lead is stored in Supabase first and only then announced
 * by email, so the team never gets notified about a lead that was not recorded.
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
    await saveLead(lead)
  } catch (error) {
    console.error('[lead] persistence failed', error)

    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'delivery_failed' },
      { status: 502 },
    )
  }

  try {
    await notifyTeamOfLead(lead)
  } catch (error) {
    /*
     * The lead is already safe in the database, so a failed notification is not
     * the visitor's problem: asking them to submit again would only duplicate
     * the row. It is logged loudly instead, for the team to catch.
     */
    console.error('[lead] notification failed', error)
  }

  // Structured, non-identifying log so deliverability can be monitored without
  // leaking the lead's personal data into the platform logs.
  console.info('[lead] received', {
    messageLength: lead.message?.length ?? 0,
    hasPackageInterest: Boolean(lead.packageInterest),
    receivedAt,
  })

  return NextResponse.json<ApiResponse<LeadAccepted>>(
    { success: true, data: { receivedAt } },
    { status: 201 },
  )
}
