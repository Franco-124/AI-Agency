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

/**
 * Notifies the team that a new lead arrived.
 *
 * `replyTo` is the lead's own address, so hitting reply in the inbox already
 * writes to the right person. A plain-text part is sent alongside the HTML
 * because text-only clients (and spam filters) expect one.
 */
export async function notifyTeamOfLead(lead: Lead): Promise<void> {
  const props = toEmailProps(lead)

  const [html, text] = await Promise.all([
    render(<NewLeadEmail {...props} />),
    render(<NewLeadEmail {...props} />, { plainText: true }),
  ])

  const { error } = await getResend().emails.send({
    from: requiredEnv('LEAD_FROM_EMAIL'),
    to: requiredEnv('NOTIFICATION_EMAIL'),
    replyTo: lead.email,
    subject: `Nuevo lead: ${lead.business}`,
    html,
    text,
  })

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`)
  }
}
