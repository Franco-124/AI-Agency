// Regenerates src/app/[locale]/stitch-home.ts from the Stitch export.
// Run: node scripts/build-stitch-home.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'
import tailwind from 'tailwindcss3'
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

let html = readFileSync(new URL('../design/stitch/code.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n')

const swap = (from, to) => {
  if (!html.includes(from)) throw new Error('Not found: ' + from.slice(0, 80))
  html = html.split(from).join(to)
}

// Marker for the SEO head block (title, meta, hreflang, OG/Twitter, JSON-LD)
// injected near the end of the script — see buildHead() below. The home
// route bypasses layout.tsx's generateMetadata entirely (route.ts returns
// this raw HTML directly), so this is the ONLY place that ships <title>,
// meta description, canonical, hreflang or structured data for the home
// page. It must be inserted before the es/en split so both variants get it.
swap('<head>\n<meta charset="utf-8">', '<head>\n<!--SEO_HEAD-->\n<meta charset="utf-8">')

// Locale switcher -> real links
swap(
  '<span class="text-on-surface font-bold cursor-pointer hover:text-primary transition-colors">ES</span>',
  '<a class="text-on-surface font-bold cursor-pointer hover:text-primary transition-colors" href="/es">ES</a>',
)
swap(
  '<span class="cursor-pointer hover:text-on-surface transition-colors">EN</span>',
  '<a class="cursor-pointer hover:text-on-surface transition-colors" href="/en">EN</a>',
)
// Footer year is filled in per request by the route (always the current year)
swap('© 2025 Numi AI.', '© __YEAR__ Numi AI.')
// No fixed call length — keep it general
swap('Llamada de 15 min sin costo', 'Llamada inicial sin costo')
swap('agendar tu llamada estratégica de 15 minutos.', 'agendar tu llamada estratégica.')
swap('Llamada de 15 minutos sin costo. Diagnóstico de viabilidad.', 'Llamada sin costo. Diagnóstico de viabilidad.')
// Privacy link
swap('href="#">Política de Privacidad</a>', 'href="/__LOCALE__/privacidad">Política de Privacidad</a>')
// Form: real submit handled by script below
swap(
  ` onsubmit="event.preventDefault(); document.getElementById('form-feedback').classList.remove('hidden'); this.reset();"`,
  ' novalidate',
)
swap('<div class="hidden p-4 rounded-xl bg-status-success/20', '<div class="hidden p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-on-surface text-center text-[13px] mt-3" id="form-error"></div>\n<div class="hidden p-4 rounded-xl bg-status-success/20')

const formScript = `
<script>
  (function () {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var ok = document.getElementById('form-feedback');
    var err = document.getElementById('form-error');
    var btn = form.querySelector('button[type="submit"]');
    function showError(msg) { err.textContent = msg; err.classList.remove('hidden'); }
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      err.classList.add('hidden'); ok.classList.add('hidden');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {
        name: document.getElementById('lead-name').value.trim(),
        whatsapp: document.getElementById('lead-whatsapp').value.trim(),
        email: document.getElementById('lead-email').value.trim(),
        message: document.getElementById('lead-message').value.trim()
      };
      var label = btn.textContent; btn.disabled = true; btn.textContent = 'Enviando...';
      try {
        var res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        var body = await res.json().catch(function () { return {}; });
        if (!res.ok || !body.success) {
          showError(res.status === 429 ? 'Demasiados intentos. Intenta de nuevo en unos minutos.' : res.status === 422 ? 'Revisa los datos: el WhatsApp o el correo no parecen válidos.' : 'No pudimos enviar tu mensaje. Escríbenos por WhatsApp.');
          return;
        }
        try { sessionStorage.setItem('numi:booking-handoff', JSON.stringify(data)); } catch (_) {}
        ok.classList.remove('hidden'); ok.style.display = 'flex';
        window.location.href = '/__LOCALE__/agendar#reserva';
      } catch (_) {
        showError('No pudimos enviar tu mensaje. Revisa tu conexión o escríbenos por WhatsApp.');
      } finally {
        btn.disabled = false; btn.textContent = label;
      }
    });
  })();
</script>
`
// Live Cortana chat (replaces the mock conversation on first send)
const chatScript = ['<script>', readFileSync(new URL('./stitch-chat.js', import.meta.url), 'utf8'), '</script>', ''].join('\n')
swap('</body></html>', formScript + chatScript + '</body></html>')


// ---- Production assets ----
// 1. Logos: download Stitch's temporary googleusercontent images into /public as WebP
mkdirSync(new URL('../public/images/stitch/', import.meta.url), { recursive: true })
const imgUrls = [...new Set([...html.matchAll(/src="(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"/g)].map((m) => m[1]))]
for (const [i, url] of imgUrls.entries()) {
  const name = `logo-${i + 1}.webp`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Image download failed: ' + url)
  await sharp(Buffer.from(await res.arrayBuffer())).resize(128, 128, { fit: 'cover' }).webp({ quality: 90 })
    .toFile(fileURLToPath(new URL('../public/images/stitch/' + name, import.meta.url)))
  swap(url, '/images/stitch/' + name)
}

// 2. Material Symbols: request only the icons the page uses
const icons = [...new Set([...html.matchAll(/material-symbols-outlined[^"]*"[^>]*>([a-z_]+)</g)].map((m) => m[1]))].sort()
swap(
  'family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"',
  'family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&amp;icon_names=' + icons.join(',') + '&amp;display=block"',
)

// 3. Tailwind: compile at build time with the design's own config instead of the CDN
const configMatch = html.match(/<script id="tailwind-config">\s*tailwind\.config = ([\s\S]*?);\s*<\/script>/)
if (!configMatch) throw new Error('Tailwind config not found')
const twTheme = new Function('return ' + configMatch[1])()
swap('<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>\n', '')
swap(configMatch[0], '')
// Preload the text fonts so they arrive sooner
swap(
  '<link href="https://fonts.googleapis.com/css2?family=Inter',
  '<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Plus+Jakarta+Sans:wght@600;700;800&amp;display=swap">\n<link href="https://fonts.googleapis.com/css2?family=Inter',
)

// ---- English version ----
const en = JSON.parse(readFileSync(new URL('./stitch-en.json', import.meta.url), 'utf8'))
const missing = new Set(Object.keys(en))
const tr = (t) => {
  const k = t.trim().replace(/\s+/g, ' ')
  if (k in en) { missing.delete(k); return t.replace(t.trim(), en[k]) }
  return t
}
// Translate text nodes and attributes outside <script>/<style>; inside scripts only quoted UI strings
let htmlEn = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/).map((chunk, i) => {
  if (i % 2 === 1) {
    return chunk.replace(/'([^'\n]+)'/g, (m, t) => (t in en ? (missing.delete(t), "'" + en[t] + "'") : m))
  }
  return chunk
    .replace(/>([^<]+)</g, (m, t) => '>' + tr(t) + '<')
    .replace(/(placeholder|alt|aria-label|value)="([^"]+)"/g, (m, a, v) => a + '="' + tr(v) + '"')
}).join('')
htmlEn = htmlEn.replace('lang="es"', 'lang="en"')
// Highlight EN as the active language
htmlEn = htmlEn
  .replace('<a class="text-on-surface font-bold cursor-pointer hover:text-primary transition-colors" href="/es">ES</a>', '<a class="cursor-pointer hover:text-on-surface transition-colors" href="/es">ES</a>')
  .replace('<a class="cursor-pointer hover:text-on-surface transition-colors" href="/en">EN</a>', '<a class="text-on-surface font-bold cursor-pointer hover:text-primary transition-colors" href="/en">EN</a>')
const { css } = await postcss([
  tailwind({ ...twTheme, content: [{ raw: html + htmlEn, extension: 'html' }], plugins: [forms, containerQueries] }),
]).process('@tailwind base;\n@tailwind components;\n@tailwind utilities;', { from: undefined })
// Light minification: drop comments, collapse whitespace
const minCss = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};])\s*/g, '$1')
html = html.replace('<style>', '<style id="tw">' + minCss + '</style>\n<style>')
htmlEn = htmlEn.replace('<style>', '<style id="tw">' + minCss + '</style>\n<style>')
console.log('css bytes', minCss.length, 'icons', icons.length, 'images', imgUrls.length)
if (missing.size) console.warn('Unused translations:', [...missing])

// ---- SEO head block (title, meta, hreflang, OG/Twitter, JSON-LD) ----
// Duplicated from src/lib/site.ts: this script runs as plain Node, outside
// the Next.js/TypeScript pipeline, so it cannot import that module.
const SITE = {
  name: 'Numi AI',
  url: 'https://www.numinet.co',
  email: 'atencionnumi@gmail.com',
  whatsapp: '573127676549',
  ogImage: '/images/03-og-social-preview.jpg',
  logo: '/images/numi-mark.png',
}
const SAME_AS = ['https://www.instagram.com/num_iai/', 'https://www.linkedin.com/company/numi-ai']

const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const ldJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c')

// Real, current copy pulled from this same build's `html`/`htmlEn` source
// (the FAQ accordion and the pricing cards) — not the stale, hand-maintained
// figures that used to live only in public/llms.txt. Keeping this inline
// means a price change in code.html gets fixed here in the same edit.
const FAQ_ES = [
  ['¿Cuánto tiempo toma implementarlo y empezar a usarlo?', 'Entre 10 y 20 días hábiles según el alcance del proyecto. Para arrancar necesitamos tres cosas de tu parte: acceso a tu WhatsApp Business, tu catálogo o lista de servicios con precios vigentes, y las preguntas que más te repiten tus clientes. Mientras construimos, tu operación continúa con normalidad: nada se apaga ni se migra hasta que el sistema esté probado y lo apruebes.'],
  ['¿Qué pasa si el agente no sabe responder algo o el cliente se enoja?', 'Escala de inmediato a una persona de tu equipo. Definimos contigo los disparadores del handoff: cuando el cliente solicita un humano, cuando aparece un reclamo o una palabra sensible, cuando la consulta sale del alcance establecido, o cuando el agente no tiene certeza suficiente. La persona recibe la conversación completa y responde con el contexto ya leído. Además ves todas las conversaciones en un panel y puedes intervenir cuando quieras: no es una caja negra.'],
  ['¿Cuánto cuesta y qué incluye exactamente el precio?', 'Depende del plan. El Agente Esencial empieza en $999.990 de implementación y $300.000 al mes. El Agente Avanzado empieza en $1.900.000 de implementación y $550.000 al mes. Los dos incluyen diagnóstico, construcción, carga de tu información, las integraciones acordadas, pruebas hasta que funcione, alojamiento, monitoreo y soporte. Si tu negocio necesita algo distinto (varias sedes, integraciones propias, sitio web completo), armamos un plan a la medida y te damos el precio después del diagnóstico. Aparte va solo el consumo de mensajes que cobra WhatsApp a través de Meta, que varía según tu volumen y te lo estimamos con tus propios números en la propuesta.'],
  ['¿Necesito saber de tecnología o tener un equipo técnico para mantenerlo?', 'No. Lo que tú haces es responder cuando una conversación te llega escalada, igual que hoy respondes un WhatsApp común. Si quieres cambiar un precio, un horario o una respuesta, se hace desde un panel visual intuitivo sin tocar código, y te enseñamos cómo en la sesión de entrega. Los errores imprevistos, actualizaciones y cambios de plataformas de Meta los resolvemos nosotros dentro de la mensualidad.'],
  ['¿Funciona con las herramientas que ya uso (CRM, WhatsApp, calendario)?', 'Hoy conectamos de forma nativa WhatsApp Business API, Google Calendar y Outlook, Google Sheets, HubSpot y formularios web, además de cualquier herramienta con API abierta. Si usas algo que no está en esa lista, lo revisamos en la llamada de diagnóstico y te decimos si se puede conectar, con qué límites, o si conviene otra ruta — siempre antes de que contrates, no después.'],
  ['¿Qué pasa si quiero cancelar o no me sirve después de un tiempo?', 'Cancelas cuando quieras avisando con 30 días de anticipación. No hay permanencia mínima forzosa ni multas por salir. Tus datos son 100% tuyos: al cerrar te entregamos el histórico completo de conversaciones y los contactos capturados en un formato estándar que puedas abrir y llevarte, y borramos de forma segura lo que quede en nuestros servidores si así lo requieres.'],
]
const FAQ_EN = [
  ['How long does it take to set up and start using it?', "Between 10 and 20 business days depending on scope. To get started we need three things from you: access to your WhatsApp Business, your catalog or service list with current prices, and the questions your customers ask most. While we build, your operation runs as usual: nothing is shut down or migrated until the system is tested and you approve it."],
  ["What if the agent can't answer something or the customer gets upset?", "It escalates immediately to someone on your team. We define the handoff triggers with you: when the customer asks for a human, when a complaint or sensitive word appears, when the question falls outside the agreed scope, or when the agent isn't confident enough. That person receives the full conversation and replies with the context already read. You also see every conversation in a dashboard and can step in whenever you want: it's not a black box."],
  ['How much does it cost and what exactly does the price include?', "It depends on the plan. The Essential Agent starts at $999,990 setup and $300,000 a month. The Advanced Agent starts at $1,900,000 setup and $550,000 a month. Both include the assessment, the build, loading your information, the agreed integrations, testing until it works, hosting, monitoring and support. If your business needs something different (multiple locations, custom integrations, a full website), we put together a custom plan and give you the price after the assessment. The only extra is WhatsApp's message fees through Meta, which vary with your volume and we estimate with your own numbers in the proposal."],
  ['Do I need to know tech or have a technical team to maintain it?', "No. All you do is reply when a conversation is escalated to you, just like answering a regular WhatsApp today. If you want to change a price, a schedule or a reply, you do it from an intuitive visual dashboard without touching code, and we show you how in the handover session. Unexpected errors, updates and Meta platform changes are handled by us within the monthly fee."],
  ['Does it work with the tools I already use (CRM, WhatsApp, calendar)?', "Today we natively connect WhatsApp Business API, Google Calendar and Outlook, Google Sheets, HubSpot and web forms, plus any tool with an open API. If you use something not on that list, we review it on the assessment call and tell you whether it can be connected, with what limits, or whether another route makes more sense — always before you sign, not after."],
  ['What if I want to cancel or it stops being useful after a while?', "Cancel anytime with 30 days' notice. There's no forced minimum term and no exit fees. Your data is 100% yours: when you leave, we hand over the full conversation history and captured contacts in a standard format you can open and take with you, and we securely delete whatever remains on our servers if you ask us to."],
]

const OFFERS_ES = [
  { name: 'Agente Esencial', description: 'Para negocios que hoy no automatizan nada y necesitan resolver lo básico: mensajes sin responder y citas mal agendadas.', minPrice: 999990 },
  { name: 'Agente Avanzado', description: 'Para negocios con volumen real de consultas diarias, donde perder un lead ya duele. Incluye todo lo del Agente Esencial, más escalado con contexto, panel de conversaciones, seguimiento automático y reporte semanal.', minPrice: 1900000 },
  { name: 'A la medida', description: 'Para negocios con varias sedes o una operación más compleja que necesita un sistema propio, no un plan fijo. Precio según diagnóstico.', minPrice: null },
]
const OFFERS_EN = [
  { name: 'Essential Agent', description: "For businesses that don't automate anything today and need to solve the basics: unanswered messages and poorly booked appointments.", minPrice: 999990 },
  { name: 'Advanced Agent', description: 'For businesses with real daily inquiry volume, where losing a lead already hurts. Includes everything in the Essential Agent, plus context-aware handoff, a conversation dashboard, automatic follow-up and a weekly report.', minPrice: 1900000 },
  { name: 'Custom', description: "For businesses with multiple locations or a more complex operation that needs its own system, not a fixed plan. Priced after the assessment.", minPrice: null },
]

function buildHead(locale) {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Numi AI — Consultoría de IA para pymes en Colombia'
    : 'Numi AI — AI consultancy for small businesses in Colombia'
  const description = isEs
    ? 'Numi AI atiende a tus clientes al instante, todo el día, para que tu equipo deje de perder tiempo y tu negocio deje de perder ventas.'
    : 'Numi AI answers your customers instantly, around the clock, so your team stops losing time and your business stops losing sales.'
  const ogImageAlt = isEs
    ? 'Numi AI — automatización con inteligencia artificial para negocios en Colombia'
    : 'Numi AI — artificial intelligence automation for businesses in Colombia'
  const url = `${SITE.url}/${locale}`
  const ogImageUrl = `${SITE.url}${SITE.ogImage}`
  const faq = isEs ? FAQ_ES : FAQ_EN
  const offers = isEs ? OFFERS_ES : OFFERS_EN

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}${SITE.logo}`,
    image: ogImageUrl,
    description,
    email: SITE.email,
    telephone: '+' + SITE.whatsapp,
    address: { '@type': 'PostalAddress', addressLocality: 'Medellín', addressCountry: 'CO' },
    areaServed: { '@type': 'Country', name: 'Colombia' },
    sameAs: SAME_AS,
    priceRange: '$999.990–$1.900.000 COP',
    makesOffer: offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      description: offer.description,
      priceCurrency: 'COP',
      ...(offer.minPrice
        ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: offer.minPrice, priceCurrency: 'COP' } }
        : {}),
    })),
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: locale,
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return [
    `<title>${escAttr(title)}</title>`,
    `<meta name="description" content="${escAttr(description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="es" href="${SITE.url}/es">`,
    `<link rel="alternate" hreflang="en" href="${SITE.url}/en">`,
    `<link rel="alternate" hreflang="x-default" href="${SITE.url}/es">`,
    '<meta name="robots" content="index, follow">',
    '<meta name="theme-color" content="#0D0A11">',
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${escAttr(SITE.name)}">`,
    `<meta property="og:locale" content="${isEs ? 'es_CO' : 'en_US'}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${escAttr(title)}">`,
    `<meta property="og:description" content="${escAttr(description)}">`,
    `<meta property="og:image" content="${ogImageUrl}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${escAttr(ogImageAlt)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escAttr(title)}">`,
    `<meta name="twitter:description" content="${escAttr(description)}">`,
    `<meta name="twitter:image" content="${ogImageUrl}">`,
    `<script type="application/ld+json">${ldJson(organization)}</script>`,
    `<script type="application/ld+json">${ldJson(website)}</script>`,
    `<script type="application/ld+json">${ldJson(faqPage)}</script>`,
  ].join('\n')
}

html = html.replace('<!--SEO_HEAD-->', buildHead('es'))
htmlEn = htmlEn.replace('<!--SEO_HEAD-->', buildHead('en'))

writeFileSync(
  new URL('../src/app/[locale]/stitch-home.ts', import.meta.url),
  '// AUTO-GENERATED by scripts/build-stitch-home.mjs from the Stitch export. Do not edit by hand.\n' +
    'export const stitchHomeHtml = ' + JSON.stringify({ es: html, en: htmlEn }) + ' as const\n',
)
console.log('ok', html.length, htmlEn.length)
