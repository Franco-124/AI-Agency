import { render } from '@react-email/components'
import { Resend } from 'resend'

import { NewLeadEmail, type NewLeadEmailProps } from '@/emails/NewLeadEmail'
import { requiredEnv } from '@/lib/env'
import type { Lead } from '@/lib/schemas'

let cachedResend: Resend | null = null

function getResend(): Resend {
  if (!cachedResend) {
    cachedResend = new Resend(requiredEnv('RESEND_API_KEY'))
  }

  return cachedResend
}

const toEmailProps = (lead: Lead): NewLeadEmailProps => ({
  name: lead.name,
  business: lead.business,
  industry: lead.industry,
  interest: lead.interest,
  whatsapp: lead.whatsapp,
  email: lead.email,
  message: lead.message,
  packageInterest: lead.packageInterest,
})

/** Why the lead could not book itself — absent when this is a plain new-lead notification. */
export type NotifyReason = 'no_availability' | 'service_failed'

/**
 * A lead that reached the calendar and could not book needs a person to
 * follow up, so it must be distinguishable at a glance in the inbox from one
 * that is simply on record.
 */
const subjectFor = (lead: Lead, reason?: NotifyReason): string => {
  const who = lead.business ?? lead.name

  if (reason === 'no_availability') return `Agendar (sin cupos): ${who}`
  if (reason === 'service_failed') return `Agendar (falló el calendario): ${who}`

  return `Nuevo lead: ${who}`
}

/**
 * Notifies the team that a new lead arrived.
 *
 * `replyTo` is the lead's own address, so hitting reply in the inbox already
 * writes to the right person. A plain-text part is sent alongside the HTML
 * because text-only clients (and spam filters) expect one.
 */
export async function notifyTeamOfLead(lead: Lead, reason?: NotifyReason): Promise<void> {
  const props = toEmailProps(lead)

  const [html, text] = await Promise.all([
    render(<NewLeadEmail {...props} />),
    render(<NewLeadEmail {...props} />, { plainText: true }),
  ])

  const { error } = await getResend().emails.send({
    from: requiredEnv('LEAD_FROM_EMAIL'),
    to: requiredEnv('NOTIFICATION_EMAIL'),
    replyTo: lead.email,
    subject: subjectFor(lead, reason),
    html,
    text,
  })

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`)
  }
}
