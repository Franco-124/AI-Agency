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
 * Internal notification sent to the team when the landing form is submitted.
 * The copy is Spanish because the recipients are the Numi AI team.
 */
export type NewLeadEmailProps = {
  name: string
  business?: string
  industry: string
  interest: string
  whatsapp: string
  email: string
  message?: string
  packageInterest?: string
}

/* Mirrors the landing's palette. Email clients ignore CSS variables, so the
   values are inlined here rather than imported from globals.css. */
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

/** wa.me only accepts digits — strip spaces, dashes and parentheses. */
const toWhatsAppUrl = (whatsapp: string) =>
  `https://wa.me/${whatsapp.replace(/\D/g, '')}`

const interestLabels: Record<string, string> = {
  automation: 'Automatización (uno de los 3 paquetes)',
  diagnostic: 'Diagnóstico de Automatización',
  training: 'Capacitación en Productividad con IA',
  unsure: 'Aún no está seguro',
}

export function NewLeadEmail({
  name,
  business,
  industry,
  interest,
  whatsapp,
  email,
  message,
  packageInterest,
}: NewLeadEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{`Nuevo lead: ${business ?? name}`}</Preview>
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
              Nuevo lead desde la landing
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
                <Text style={label}>Negocio</Text>
                <Text style={value}>{business ?? 'No indicado'}</Text>
              </Column>
            </Row>

            <Hr style={{ borderColor: colors.secondary, margin: '16px 0' }} />

            <Row>
              <Column>
                <Text style={label}>A qué se dedica</Text>
                <Text style={{ ...value, fontWeight: 400, fontSize: '14px' }}>
                  {industry}
                </Text>
              </Column>
              <Column>
                <Text style={label}>Qué le interesa</Text>
                <Text style={{ ...value, color: colors.accent, fontSize: '14px' }}>
                  {interestLabels[interest] ?? interest}
                </Text>
              </Column>
            </Row>

            {packageInterest ? (
              <>
                <Hr style={{ borderColor: colors.secondary, margin: '16px 0' }} />
                <Row>
                  <Column>
                    <Text style={label}>Paquete de interés</Text>
                    <Text style={{ ...value, color: colors.accent, fontSize: '14px' }}>
                      {packageInterest}
                    </Text>
                  </Column>
                </Row>
              </>
            ) : null}

            <Hr style={{ borderColor: colors.secondary, margin: '16px 0' }} />

            <Row>
              <Column>
                <Text style={label}>WhatsApp</Text>
                <Text style={{ ...value, fontSize: '14px' }}>{whatsapp}</Text>
              </Column>
              <Column>
                <Text style={label}>Correo</Text>
                <Text style={{ ...value, fontSize: '14px' }}>{email}</Text>
              </Column>
            </Row>

            <Hr style={{ borderColor: colors.secondary, margin: '16px 0' }} />

            <Text style={label}>Qué necesita</Text>
            <Text
              style={{
                color: colors.lightNeutral,
                fontSize: '14px',
                margin: '4px 0 0',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
              }}
            >
              {message ?? 'No dejó un mensaje adicional.'}
            </Text>
          </Section>

          <Section style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button
              href={toWhatsAppUrl(whatsapp)}
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
              Responder por WhatsApp
            </Button>
            <Button
              href={`mailto:${email}`}
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
              Responder por correo
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
            Recibido desde el formulario de la landing · Contactar dentro de 24 horas
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default NewLeadEmail
