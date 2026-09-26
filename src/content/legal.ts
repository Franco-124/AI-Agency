import type { Locale } from '@/i18n/routing'
import { legalEntity as e, siteConfig } from '@/lib/site'

/**
 * The three legal documents — privacy (tratamiento de datos), terms and
 * cookies — in both locales.
 *
 * Every factual statement here describes what the site actually does, and has
 * to be kept that way: which third parties receive data, what is stored in the
 * browser, what each form collects. If the code changes one of those (a new
 * analytics script, a new form field, a new provider), the matching section
 * here changes in the same commit — a policy that no longer matches the site
 * is itself the liability.
 *
 * Spanish is the governing text; the English one is a courtesy translation and
 * says so.
 */

export type LegalBlock = string | { list: string[] }

export type LegalSection = { title: string; body: LegalBlock[] }

export type LegalDocument = {
  title: string
  metaDescription: string
  intro: string
  sections: LegalSection[]
}

export type LegalDocKey = 'privacy' | 'terms' | 'cookies'

export const legalPaths: Record<LegalDocKey, string> = {
  privacy: 'privacidad',
  terms: 'terminos',
  cookies: 'cookies',
}

/**
 * Who receives personal data on the controller's behalf ("encargados"), and
 * why. One list so the privacy and cookie policies cannot disagree.
 */
const processors = {
  es: [
    'Vercel Inc. (Estados Unidos): alojamiento del sitio y registros técnicos de acceso.',
    'Supabase Inc.: base de datos donde guardamos los datos del formulario de contacto.',
    'Resend (Plus Five Five, Inc., Estados Unidos): envío de los correos internos que nos avisan de una nueva solicitud y de los correos de confirmación y recordatorio de citas.',
    'Railway Corp. (Estados Unidos): servidor que gestiona la agenda de citas y el asistente de chat.',
    'OpenAI, L.L.C. (Estados Unidos): procesa los mensajes que escribes en el chat del asistente para generar la respuesta.',
  ],
  en: [
    'Vercel Inc. (United States): hosting of the site and technical access logs.',
    'Supabase Inc.: database where we keep the contact form submissions.',
    'Resend (Plus Five Five, Inc., United States): delivery of the internal emails that tell us about a new request, and of appointment confirmation and reminder emails.',
    'Railway Corp. (United States): server that runs the appointment calendar and the chat assistant.',
    'OpenAI, L.L.C. (United States): processes the messages you type into the chat assistant to generate its reply.',
  ],
}

const privacy: Record<Locale, LegalDocument> = {
  es: {
    title: 'Política de tratamiento de datos personales',
    metaDescription:
      'Cómo Numi AI recolecta, usa, comparte y protege tus datos personales, y cómo ejercer tus derechos según la Ley 1581 de 2012.',
    intro:
      'Esta política explica qué datos personales recibimos a través de numinet.co, para qué los usamos, con quién los compartimos y cómo puedes ejercer tus derechos. Se expide en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y demás normas colombianas sobre protección de datos.',
    sections: [
      {
        title: '1. Responsable del tratamiento',
        body: [
          `${e.commercialName}, con domicilio en ${e.city}, es el Responsable del Tratamiento de los datos que recibe a través de este sitio. Puedes contactarnos por estos canales:`,
          {
            list: [
              `Ciudad: ${e.city}`,
              `Correo electrónico: ${e.email}`,
              `Teléfono y WhatsApp: ${e.phone}`,
              `Sitio web: ${siteConfig.url}`,
            ],
          },
        ],
      },
      {
        title: '2. Qué datos recolectamos',
        body: [
          'Solo los que tú nos entregas y los técnicos mínimos para que el sitio funcione:',
          {
            list: [
              'Formulario de contacto: nombre, número de WhatsApp, correo electrónico y la descripción de lo que necesitas.',
              'Agenda de citas: nombre, WhatsApp, correo electrónico, la fecha y hora que eliges y, si vienes del formulario, tu mensaje.',
              'Chat con el asistente (Cortana): los mensajes que escribes y un identificador aleatorio de la conversación. No te pedimos datos de identificación en el chat.',
              'Datos técnicos: dirección IP y datos del navegador que cualquier servidor web recibe al atender una visita, usados para seguridad y para limitar el envío abusivo de formularios.',
            ],
          },
          'No solicitamos datos sensibles (salud, origen racial o étnico, orientación política, creencias, datos biométricos, etc.) ni datos de niños, niñas o adolescentes. Te pedimos no incluirlos en tus mensajes. Este sitio no está dirigido a menores de 18 años.',
        ],
      },
      {
        title: '3. Para qué usamos tus datos',
        body: [
          {
            list: [
              'Responder tu solicitud y contactarte por WhatsApp o correo para coordinar la llamada que pediste.',
              'Agendar tu cita y enviarte la confirmación y los recordatorios.',
              'Evaluar tu caso y preparar una propuesta ajustada a tu negocio.',
              'Responder tus preguntas en el chat.',
              'Proteger el sitio contra abuso y fraude.',
            ],
          },
          'No usamos tus datos para publicidad, no construimos perfiles con ellos y no te enviaremos comunicaciones comerciales masivas sin una autorización adicional y separada.',
        ],
      },
      {
        title: '4. Autorización',
        body: [
          'Antes de enviar el formulario de contacto o agendar una cita te pedimos marcar una casilla con la que autorizas de forma previa, expresa e informada el tratamiento de tus datos según esta política. La casilla nunca viene marcada. Guardamos la fecha y la versión de la política que aceptaste como prueba de esa autorización.',
          'Al usar el chat, lo que escribes se procesa para responderte; el aviso junto al campo de texto te lo indica antes de enviar.',
        ],
      },
      {
        title: '5. Con quién compartimos tus datos',
        body: [
          'No vendemos ni cedemos tus datos. Para operar el sitio usamos proveedores que los tratan por nuestra cuenta, solo para prestarnos su servicio (encargados del tratamiento):',
          { list: processors.es },
          'Algunos de estos proveedores almacenan o procesan información fuera de Colombia, principalmente en Estados Unidos. Con tu autorización expresa aceptas esa transferencia internacional (Ley 1581 de 2012, art. 26). Si hablas con nosotros por WhatsApp, esa conversación se rige además por las políticas de WhatsApp (Meta).',
          'También podremos entregar datos a una autoridad que los solicite en ejercicio de sus funciones legales.',
        ],
      },
      {
        title: '6. Cuánto tiempo los conservamos',
        body: [
          'Conservamos los datos del formulario y de la agenda mientras exista una relación comercial o una conversación activa contigo y, después, solo el tiempo necesario para atender obligaciones legales o reclamaciones. Si nos pides eliminarlos y no existe un deber legal de conservarlos, los eliminamos.',
          'El historial del chat se guarda en tu propio navegador y puedes borrarlo en cualquier momento (ver la Política de cookies).',
        ],
      },
      {
        title: '7. Tus derechos',
        body: [
          'Como titular de los datos tienes derecho a:',
          {
            list: [
              'Conocer, actualizar y rectificar tus datos.',
              'Solicitar prueba de la autorización que nos diste.',
              'Ser informado sobre el uso que les damos.',
              'Revocar la autorización o pedir la supresión de tus datos cuando no exista un deber legal o contractual de conservarlos.',
              'Acceder gratuitamente a tus datos.',
              'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) una vez agotado el trámite ante nosotros.',
            ],
          },
        ],
      },
      {
        title: '8. Cómo ejercer tus derechos',
        body: [
          `Escríbenos a ${e.email} indicando tu nombre, tu solicitud concreta y un dato de contacto para responderte. Si actúas en nombre de otra persona, acredita que puedes hacerlo.`,
          {
            list: [
              'Consultas: respondemos dentro de los 10 días hábiles siguientes a su recibo, prorrogables hasta 5 días hábiles más avisándote el motivo (Ley 1581, art. 14).',
              'Reclamos (corrección, actualización, supresión o revocatoria): respondemos dentro de los 15 días hábiles siguientes, prorrogables hasta 8 días hábiles más avisándote el motivo (Ley 1581, art. 15).',
            ],
          },
        ],
      },
      {
        title: '9. Seguridad',
        body: [
          'El sitio funciona solo sobre conexión cifrada (HTTPS). Las claves de acceso a la base de datos y a los servicios de correo están únicamente en el servidor, nunca en tu navegador, y el acceso a los datos se limita a quienes los necesitan para atenderte. Ningún sistema es infalible; si detectamos un incidente que afecte tus datos te lo informaremos y lo reportaremos a la SIC como exige la ley.',
        ],
      },
      {
        title: '10. Cambios y vigencia',
        body: [
          `Esta política rige desde el ${e.updated.es} (versión ${e.policyVersion}). Si cambia en algo sustancial lo publicaremos aquí y, si el cambio afecta la finalidad para la que nos diste tus datos, te pediremos una nueva autorización.`,
        ],
      },
    ],
  },
  en: {
    title: 'Personal data policy',
    metaDescription:
      'How Numi AI collects, uses, shares and protects your personal data, and how to exercise your rights under Colombian Law 1581 of 2012.',
    intro:
      'This policy explains which personal data we receive through numinet.co, what we use it for, who we share it with and how you can exercise your rights. It is issued under Colombian Law 1581 of 2012, Decree 1377 of 2013 (compiled in Decree 1074 of 2015) and other Colombian data protection rules. This English version is a courtesy translation; the Spanish text governs.',
    sections: [
      {
        title: '1. Data controller',
        body: [
          `${e.commercialName}, domiciled in ${e.city}, is the controller of the data it receives through this site. You can reach us through these channels:`,
          {
            list: [
              `City: ${e.city}`,
              `Email: ${e.email}`,
              `Phone and WhatsApp: ${e.phone}`,
              `Website: ${siteConfig.url}`,
            ],
          },
        ],
      },
      {
        title: '2. What data we collect',
        body: [
          'Only what you give us, plus the minimum technical data the site needs to work:',
          {
            list: [
              'Contact form: name, WhatsApp number, email and the description of what you need.',
              'Appointment booking: name, WhatsApp, email, the date and time you choose and, if you came from the form, your message.',
              'Chat assistant (Cortana): the messages you type and a random conversation identifier. We do not ask for identifying data in the chat.',
              'Technical data: the IP address and browser data any web server receives when serving a visit, used for security and to limit abusive form submissions.',
            ],
          },
          'We do not ask for sensitive data (health, racial or ethnic origin, political views, beliefs, biometric data, etc.) or data about children. Please do not include it in your messages. This site is not directed at anyone under 18.',
        ],
      },
      {
        title: '3. What we use it for',
        body: [
          {
            list: [
              'To answer your request and contact you by WhatsApp or email to arrange the call you asked for.',
              'To book your appointment and send you its confirmation and reminders.',
              'To assess your case and prepare a proposal for your business.',
              'To answer your questions in the chat.',
              'To protect the site against abuse and fraud.',
            ],
          },
          'We do not use your data for advertising, we do not build profiles with it, and we will not send you bulk marketing without a separate, additional authorization.',
        ],
      },
      {
        title: '4. Authorization',
        body: [
          'Before you send the contact form or book an appointment we ask you to tick a box by which you give prior, express and informed authorization to process your data under this policy. The box is never pre-ticked. We keep the date and the policy version you accepted as proof of that authorization.',
          'When you use the chat, what you type is processed to answer you; the notice next to the text field tells you so before you send.',
        ],
      },
      {
        title: '5. Who we share it with',
        body: [
          'We do not sell or transfer your data. To run the site we use providers that process it on our behalf, only to provide their service to us (data processors):',
          { list: processors.en },
          'Some of these providers store or process information outside Colombia, mainly in the United States. With your express authorization you accept that international transfer (Law 1581 of 2012, art. 26). If you talk to us on WhatsApp, that conversation is also governed by WhatsApp (Meta) policies.',
          'We may also disclose data to an authority that requests it in the exercise of its legal powers.',
        ],
      },
      {
        title: '6. How long we keep it',
        body: [
          'We keep form and booking data while there is a business relationship or an active conversation with you and, afterwards, only as long as needed to meet legal obligations or handle claims. If you ask us to delete it and there is no legal duty to keep it, we delete it.',
          'The chat history is stored in your own browser and you can clear it at any time (see the Cookie policy).',
        ],
      },
      {
        title: '7. Your rights',
        body: [
          'As the data subject you have the right to:',
          {
            list: [
              'Know, update and correct your data.',
              'Request proof of the authorization you gave us.',
              'Be told how we use it.',
              'Revoke the authorization or ask for your data to be deleted when there is no legal or contractual duty to keep it.',
              'Access your data free of charge.',
              "File complaints with Colombia's Superintendence of Industry and Commerce (SIC) after first raising them with us.",
            ],
          },
        ],
      },
      {
        title: '8. How to exercise your rights',
        body: [
          `Write to ${e.email} with your name, your specific request and a way to reach you. If you act on someone else's behalf, show that you are entitled to.`,
          {
            list: [
              'Queries: answered within 10 business days of receipt, extendable by up to 5 more business days with notice of the reason (Law 1581, art. 14).',
              'Claims (correction, update, deletion or revocation): answered within 15 business days, extendable by up to 8 more business days with notice of the reason (Law 1581, art. 15).',
            ],
          },
        ],
      },
      {
        title: '9. Security',
        body: [
          'The site runs only over an encrypted connection (HTTPS). The keys to the database and the email services live only on the server, never in your browser, and access to the data is limited to those who need it to serve you. No system is infallible; if we detect an incident affecting your data we will tell you and report it to the SIC as the law requires.',
        ],
      },
      {
        title: '10. Changes and effective date',
        body: [
          `This policy is effective from ${e.updated.en} (version ${e.policyVersion}). If it changes in any material way we will publish it here and, if the change affects the purpose for which you gave us your data, we will ask for a new authorization.`,
        ],
      },
    ],
  },
}

const terms: Record<Locale, LegalDocument> = {
  es: {
    title: 'Términos y condiciones',
    metaDescription: 'Condiciones de uso del sitio numinet.co y de sus herramientas: formulario, agenda, chat y calculadora de ROI.',
    intro:
      'Estos términos regulan el uso del sitio numinet.co. Al navegarlo o usar sus herramientas los aceptas; si no estás de acuerdo, te pedimos no usarlo.',
    sections: [
      {
        title: '1. Quién presta el servicio',
        body: [
          `${e.commercialName}, con domicilio en ${e.city}. Contacto: ${e.email} · ${e.phone}.`,
        ],
      },
      {
        title: '2. Qué es este sitio',
        body: [
          'El sitio presenta los servicios de consultoría, automatización e inteligencia artificial de Numi AI y te permite contactarnos, agendar una llamada, conversar con un asistente automático y estimar el retorno de una automatización. Navegar el sitio no crea una relación contractual: los servicios se contratan mediante una propuesta o contrato escrito que define alcance, precio, plazos y condiciones.',
        ],
      },
      {
        title: '3. Precios',
        body: [
          'Los precios publicados están en pesos colombianos y describen los planes vigentes al momento de la publicación. El precio final, los impuestos aplicables y lo que incluye cada servicio se confirman por escrito en la propuesta antes de que contrates. Los costos de terceros que se mencionan como aparte (por ejemplo, el consumo de mensajes que cobra Meta por WhatsApp) no son cobrados por Numi AI y dependen de las tarifas de ese tercero.',
        ],
      },
      {
        title: '4. Calculadora de ROI',
        body: [
          'La calculadora entrega una estimación ilustrativa a partir de los datos que ingresas y de supuestos generales sobre la nómina colombiana. No es una asesoría contable, laboral, tributaria ni financiera, no constituye una oferta ni garantiza resultados. Para decisiones concretas consulta a un profesional con los datos reales de tu empresa.',
        ],
      },
      {
        title: '5. Asistente de chat',
        body: [
          'Cortana es un asistente automático basado en inteligencia artificial. Sus respuestas pueden contener errores u omisiones, son informativas y no obligan a Numi AI a una oferta, precio o compromiso; lo que vale es lo que acordemos por escrito. No compartas en el chat datos sensibles, contraseñas ni información financiera.',
        ],
      },
      {
        title: '6. Uso adecuado',
        body: [
          'Te comprometes a no usar el sitio para fines ilícitos, a no enviar información falsa o de terceros sin su autorización, a no intentar acceder a sistemas o datos que no te corresponden y a no automatizar envíos masivos a los formularios o al chat.',
        ],
      },
      {
        title: '7. Propiedad intelectual',
        body: [
          'Los textos, el diseño, el logotipo y el código del sitio pertenecen a Numi AI o se usan con autorización, y están protegidos por las normas de derechos de autor y propiedad industrial. No puedes copiarlos ni reutilizarlos con fines comerciales sin permiso escrito.',
          'WhatsApp, Meta, Google, Google Calendar, Google Sheets, Outlook, HubSpot y demás marcas mencionadas pertenecen a sus respectivos titulares. Las citamos solo para describir con qué herramientas se integran nuestros servicios; su mención no implica patrocinio, afiliación ni respaldo.',
        ],
      },
      {
        title: '8. Enlaces a terceros',
        body: [
          'El sitio enlaza a servicios de terceros (WhatsApp, Instagram, LinkedIn). No controlamos su contenido ni sus políticas, que se rigen por sus propios términos.',
        ],
      },
      {
        title: '9. Responsabilidad',
        body: [
          'Procuramos que la información del sitio sea exacta y que funcione sin interrupciones, pero no podemos garantizarlo en todo momento. En la medida en que la ley lo permita, Numi AI no responde por daños derivados de interrupciones, errores de terceros proveedores o decisiones tomadas solo con base en la información general del sitio. Nada en estos términos limita los derechos que te reconoce la Ley 1480 de 2011 (Estatuto del Consumidor) cuando actúas como consumidor.',
        ],
      },
      {
        title: '10. Datos personales y cookies',
        body: [
          'El tratamiento de tus datos se rige por nuestra Política de tratamiento de datos personales y el uso de almacenamiento en tu navegador por nuestra Política de cookies.',
        ],
      },
      {
        title: '11. Peticiones, quejas y reclamos',
        body: [
          `Puedes enviarnos cualquier petición, queja o reclamo a ${e.email} o al WhatsApp ${e.phone}. Respondemos dentro de los 15 días hábiles siguientes. Si actúas como consumidor también puedes acudir a la Superintendencia de Industria y Comercio.`,
        ],
      },
      {
        title: '12. Ley aplicable y cambios',
        body: [
          `Estos términos se rigen por las leyes de la República de Colombia. Podemos actualizarlos; la versión vigente es la publicada aquí, con fecha del ${e.updated.es}.`,
        ],
      },
    ],
  },
  en: {
    title: 'Terms and conditions',
    metaDescription: 'Terms of use for numinet.co and its tools: contact form, booking, chat and ROI calculator.',
    intro:
      'These terms govern the use of numinet.co. By browsing it or using its tools you accept them; if you do not agree, please do not use it. This English version is a courtesy translation; the Spanish text governs.',
    sections: [
      {
        title: '1. Who provides the service',
        body: [
          `${e.commercialName}, domiciled in ${e.city}. Contact: ${e.email} · ${e.phone}.`,
        ],
      },
      {
        title: '2. What this site is',
        body: [
          "The site presents Numi AI's consulting, automation and artificial intelligence services and lets you contact us, book a call, talk to an automated assistant and estimate the return on an automation. Browsing the site does not create a contract: services are engaged through a written proposal or contract that sets scope, price, timelines and conditions.",
        ],
      },
      {
        title: '3. Prices',
        body: [
          'Published prices are in Colombian pesos and describe the plans current at the time of publication. The final price, applicable taxes and what each service includes are confirmed in writing in the proposal before you engage us. Third-party costs described as separate (for example, the WhatsApp messaging fees charged by Meta) are not charged by Numi AI and depend on that third party’s rates.',
        ],
      },
      {
        title: '4. ROI calculator',
        body: [
          'The calculator gives an illustrative estimate based on the data you enter and on general assumptions about Colombian payroll. It is not accounting, labor, tax or financial advice, it is not an offer and it does not guarantee results. For real decisions, consult a professional with your company’s actual figures.',
        ],
      },
      {
        title: '5. Chat assistant',
        body: [
          'Cortana is an automated assistant based on artificial intelligence. Its answers may contain errors or omissions, are for information only and do not bind Numi AI to any offer, price or commitment; only what we agree in writing does. Do not share sensitive data, passwords or financial information in the chat.',
        ],
      },
      {
        title: '6. Acceptable use',
        body: [
          'You agree not to use the site for unlawful purposes, not to submit false information or third-party data without their authorization, not to try to access systems or data that are not yours and not to automate bulk submissions to the forms or the chat.',
        ],
      },
      {
        title: '7. Intellectual property',
        body: [
          "The site's text, design, logo and code belong to Numi AI or are used with permission, and are protected by copyright and industrial property law. You may not copy or reuse them commercially without written permission.",
          'WhatsApp, Meta, Google, Google Calendar, Google Sheets, Outlook, HubSpot and other brands mentioned belong to their respective owners. We cite them only to describe which tools our services integrate with; mentioning them implies no sponsorship, affiliation or endorsement.',
        ],
      },
      {
        title: '8. Third-party links',
        body: [
          'The site links to third-party services (WhatsApp, Instagram, LinkedIn). We do not control their content or policies, which are governed by their own terms.',
        ],
      },
      {
        title: '9. Liability',
        body: [
          'We try to keep the site accurate and available, but cannot guarantee it at all times. To the extent the law allows, Numi AI is not liable for damages arising from outages, third-party provider errors or decisions made solely on the general information on the site. Nothing in these terms limits the rights granted to you by Colombian Law 1480 of 2011 (Consumer Statute) when you act as a consumer.',
        ],
      },
      {
        title: '10. Personal data and cookies',
        body: [
          'The processing of your data is governed by our Personal data policy, and the use of storage in your browser by our Cookie policy.',
        ],
      },
      {
        title: '11. Requests, complaints and claims',
        body: [
          `You can send any request, complaint or claim to ${e.email} or to WhatsApp ${e.phone}. We answer within 15 business days. If you act as a consumer you may also turn to the Superintendence of Industry and Commerce.`,
        ],
      },
      {
        title: '12. Governing law and changes',
        body: [
          `These terms are governed by the laws of the Republic of Colombia. We may update them; the current version is the one published here, dated ${e.updated.en}.`,
        ],
      },
    ],
  },
}

const cookies: Record<Locale, LegalDocument> = {
  es: {
    title: 'Política de cookies',
    metaDescription: 'Qué cookies y almacenamiento del navegador usa numinet.co, para qué sirven y cómo borrarlos.',
    intro:
      'Este sitio no usa cookies de publicidad, de analítica ni de redes sociales, y no te rastrea entre sitios. Solo guarda en tu navegador lo imprescindible para que funcione. Aquí está la lista completa.',
    sections: [
      {
        title: '1. Qué guardamos en tu navegador',
        body: [
          {
            list: [
              'NEXT_LOCALE (cookie propia, técnica): recuerda si ves el sitio en español o en inglés. Dura lo que dure tu sesión del navegador.',
              'numi:chat:session, numi:chat:history y numi:chat:latency (almacenamiento local): un identificador aleatorio de tu conversación con el asistente, el historial de esa conversación para que no se pierda al recargar la página, y los tiempos de respuesta recientes para mostrarte una espera realista. Permanecen hasta que los borres.',
              'numi:booking-handoff (almacenamiento de sesión): lleva los datos que escribiste en el formulario de contacto a la página de agenda para que no tengas que escribirlos otra vez. Se borra al usarse o al cerrar la pestaña.',
            ],
          },
        ],
      },
      {
        title: '2. ¿Necesitamos tu consentimiento?',
        body: [
          'Todo lo anterior es estrictamente necesario para prestarte una función que tú pides (ver el sitio en tu idioma, conversar con el asistente, agendar sin repetir datos), por eso no mostramos un aviso para aceptarlas. Si algún día incorporamos analítica, publicidad u otras cookies no esenciales, te pediremos permiso antes de activarlas y actualizaremos esta política.',
        ],
      },
      {
        title: '3. Servicios de terceros',
        body: [
          'El sitio no carga scripts, fuentes ni imágenes de terceros: todo se sirve desde numinet.co. Los enlaces a WhatsApp, Instagram y LinkedIn solo te llevan a esos servicios cuando haces clic; a partir de ahí aplican sus propias políticas.',
        ],
      },
      {
        title: '4. Cómo borrarlas',
        body: [
          'Puedes borrar las cookies y el almacenamiento del sitio desde la configuración de privacidad de tu navegador (por ejemplo, en Chrome: Configuración › Privacidad y seguridad › Cookies y otros datos de sitios). El sitio seguirá funcionando; solo se perderá el historial del chat y la preferencia de idioma.',
        ],
      },
      {
        title: '5. Más información',
        body: [
          `Para cualquier duda escríbenos a ${e.email}. Esta política se actualizó el ${e.updated.es}.`,
        ],
      },
    ],
  },
  en: {
    title: 'Cookie policy',
    metaDescription: 'Which cookies and browser storage numinet.co uses, what they are for and how to clear them.',
    intro:
      'This site uses no advertising, analytics or social media cookies and does not track you across sites. It only stores what it strictly needs to work in your browser. Here is the complete list. This English version is a courtesy translation; the Spanish text governs.',
    sections: [
      {
        title: '1. What we store in your browser',
        body: [
          {
            list: [
              'NEXT_LOCALE (first-party, technical cookie): remembers whether you view the site in Spanish or English. Lasts for your browser session.',
              'numi:chat:session, numi:chat:history and numi:chat:latency (local storage): a random identifier for your conversation with the assistant, that conversation’s history so it survives a page reload, and recent response times to show you a realistic wait. They stay until you clear them.',
              'numi:booking-handoff (session storage): carries what you typed in the contact form to the booking page so you do not have to type it again. Cleared once used or when you close the tab.',
            ],
          },
        ],
      },
      {
        title: '2. Do we need your consent?',
        body: [
          'Everything above is strictly necessary to provide a feature you ask for (viewing the site in your language, talking to the assistant, booking without retyping), which is why we do not show a banner asking you to accept it. If we ever add analytics, advertising or other non-essential cookies, we will ask your permission before enabling them and update this policy.',
        ],
      },
      {
        title: '3. Third-party services',
        body: [
          'The site loads no third-party scripts, fonts or images: everything is served from numinet.co. Links to WhatsApp, Instagram and LinkedIn only take you to those services when you click them; from then on their own policies apply.',
        ],
      },
      {
        title: '4. How to clear them',
        body: [
          "You can clear the site's cookies and storage from your browser's privacy settings (for example, in Chrome: Settings › Privacy and security › Cookies and other site data). The site keeps working; you only lose the chat history and the language preference.",
        ],
      },
      {
        title: '5. More information',
        body: [`For any question write to ${e.email}. This policy was last updated on ${e.updated.en}.`],
      },
    ],
  },
}

export const legalDocuments: Record<LegalDocKey, Record<Locale, LegalDocument>> = { privacy, terms, cookies }
