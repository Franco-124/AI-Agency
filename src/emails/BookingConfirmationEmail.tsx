import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

/**
 * Internal notification sent to the team when someone books a demo call.
 * The copy is Spanish because the recipients are the Numi AI team.
 */
export type BookingConfirmationEmailProps = {
  name: string
  email: string
  phone: string
  scheduledTime: string
  notes?: string
}

const colors = {
  primary: '#1A1420',
  secondary: '#322B3D',
  accent: '#9333EA',
  darkNeutral: '#0D0A11',
  lightNeutral: '#F5F3F8',
} as const

const label = {
  color: colors.lightNeutral,
  opacity: 0.5,
  fontSize: '12px',
  margin: 0,
} as const

const value = {
  color: colors.lightNeutral,
  fontSize: '15px',
  margin: '2px 0 0',
  fontWeight: 600,
} as const

const toWhatsAppUrl = (phone: string) =>
  `https://wa.me/${phone.replace(/\D/g, '')}`

const CALENDAR_URL = 'https://calendar.google.com'

export function BookingConfirmationEmail({
  name,
  email,
  phone,
  scheduledTime,
  notes,
}: BookingConfirmationEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{`Nueva llamada agendada: ${name}`}</Preview>
      <Body
        style={{
          backgroundColor: colors.darkNeutral,
          fontFamily: 'Helvetica, Arial, sans-serif',
          margin: 0,
          padding: 0,
        }}
      >
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px' }}>
          <Section style={{ marginBottom: '24px' }}>
            <Text
              style={{
                color: colors.accent,
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Numi AI
            </Text>
            <Heading
              style={{ color: colors.lightNeutral, fontSize: '22px', margin: '8px 0 0' }}
            >
              Nueva llamada agendada
            </Heading>
          </Section>

          <Section
            style={{
              backgroundColor: colors.primary,
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${colors.secondary}`,
            }}
          >
            <Row>
              <Column>
                <Text style={label}>Nombre</Text>
                <Text style={value}>{name}</Text>
              </Column>
              <Column>
                <Text style={label}>Correo</Text>
                <Text style={{ ...value, fontSize: '14px' }}>{email}</Text>
              </Column>
            </Row>

            <Hr style={{ borderColor: colors.secondary, margin: '16px 0' }} />

            <Row>
              <Column>
                <Text style={label}>WhatsApp</Text>
                <Text style={{ ...value, fontSize: '14px' }}>{phone}</Text>
              </Column>
              <Column>
                <Text style={label}>Fecha y hora</Text>
                <Text style={{ ...value, color: colors.accent, fontSize: '14px' }}>
                  {scheduledTime}
                </Text>
              </Column>
            </Row>

            {notes ? (
              <>
                <Hr style={{ borderColor: colors.secondary, margin: '16px 0' }} />
                <Text style={label}>Notas</Text>
                <Text
                  style={{
                    color: colors.lightNeutral,
                    fontSize: '14px',
                    margin: '4px 0 0',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {notes}
                </Text>
              </>
            ) : null}
          </Section>

          <Section style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button
              href={CALENDAR_URL}
              style={{
                backgroundColor: colors.accent,
                color: colors.darkNeutral,
                fontSize: '14px',
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                marginRight: '12px',
              }}
            >
              Ver en Google Calendar
            </Button>
            <Button
              href={toWhatsAppUrl(phone)}
              style={{
                backgroundColor: 'transparent',
                color: colors.lightNeutral,
                fontSize: '14px',
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                border: `1px solid ${colors.secondary}`,
              }}
            >
              Responder por WhatsApp
            </Button>
          </Section>

          <Text
            style={{
              color: colors.lightNeutral,
              opacity: 0.35,
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '32px',
            }}
          >
            Booking confirmado automáticamente · Contactar dentro de 24 horas
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingConfirmationEmail
