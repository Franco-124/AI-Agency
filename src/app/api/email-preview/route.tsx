import { render } from '@react-email/components'

import { NewLeadEmail } from '@/emails/NewLeadEmail'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Development-only preview of the new-lead notification, so the template can be
 * checked in a browser without sending a real email or adding the react-email
 * CLI as a dependency. It is never exposed in production.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 })
  }

  const html = await render(
    <NewLeadEmail
      name="Ana Gómez"
      business="Clínica Dental Sonrisa"
      industry="Clínicas y consultorios"
      interest="automation"
      whatsapp="+57 313 582 0975"
      email="ana@sonrisa.co"
      message={'Necesitamos automatizar la agenda.\nHoy respondemos a mano por WhatsApp.'}
      packageInterest="Presencia Digital + Agente Esencial"
    />,
  )

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
