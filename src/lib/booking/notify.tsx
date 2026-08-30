import { render } from '@react-email/components'
import { Resend } from 'resend'

import { BookingConfirmationEmail } from '@/emails/BookingConfirmationEmail'
import { requiredEnv } from '@/lib/env'

let cachedResend: Resend | null = null

function getResend(): Resend {
  if (!cachedResend) {
    cachedResend = new Resend(requiredEnv('RESEND_API_KEY'))
  }

  return cachedResend
}

/**
 * Notifies the team that someone successfully booked a demo call.
 */
export async function notifyTeamOfBooking(booking: {
  name: string
  email: string
  phone: string
  scheduledTime: string
  notes?: string
}): Promise<void> {
  const [html, text] = await Promise.all([
    render(
      <BookingConfirmationEmail
        name={booking.name}
        email={booking.email}
        phone={booking.phone}
        scheduledTime={booking.scheduledTime}
        notes={booking.notes}
      />,
    ),
    render(
      <BookingConfirmationEmail
        name={booking.name}
        email={booking.email}
        phone={booking.phone}
        scheduledTime={booking.scheduledTime}
        notes={booking.notes}
      />,
      { plainText: true },
    ),
  ])

  const { error } = await getResend().emails.send({
    from: requiredEnv('LEAD_FROM_EMAIL'),
    to: requiredEnv('NOTIFICATION_EMAIL'),
    replyTo: booking.email,
    subject: `Nueva llamada agendada: ${booking.name}`,
    html,
    text,
  })

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`)
  }
}
