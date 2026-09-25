// Regenerates src/app/[locale]/stitch-roi.ts from the Stitch "Calculadora de
// ROI" export, the same way scripts/build-stitch-home.mjs does for the home.
// Run: node scripts/build-stitch-roi.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'
import tailwind from 'tailwindcss3'
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

// Normalised to LF on read, for the reason given in build-stitch-home.mjs.
let html = readFileSync(new URL('../design/stitch/roi.html', import.meta.url), 'utf8').replace(
  /\r\n/g,
  '\n',
)

const swap = (from, to) => {
  if (!html.includes(from)) throw new Error('Not found: ' + from.slice(0, 90))
  html = html.split(from).join(to)
}

/** Rewrites every `href="#"` on the anchors Stitch tagged with `data-path`. */
const wire = (path, href) => {
  const needle = 'data-path="' + path + '" href="#"'
  if (!html.includes(needle)) throw new Error('No anchor for data-path=' + path)
  html = html.split(needle).join('data-path="' + path + '" href="' + href + '"')
}

/** Removes an entire anchor element, matched by its visible text. */
const dropAnchor = (text) => {
  const re = new RegExp('<a\\b[^>]*>\\s*' + text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*</a>', 'g')
  if (!re.test(html)) throw new Error('No anchor with text: ' + text)
  html = html.replace(re, '')
}

// ---- Navigation ----
// The export's chrome links nowhere (`href="#"` throughout). Section anchors
// point back at the home page rather than at this one, because the sections
// they name live there.
wire('inicio', '/__LOCALE__')
wire('servicios', '/__LOCALE__#servicios')
wire('proceso', '/__LOCALE__#proceso')
wire('planes-y-precios', '/__LOCALE__#planes')
wire('faq', '/__LOCALE__#preguntas-frecuentes')
wire('calculadora-de-roi', '/__LOCALE__/calculadora-roi')
// The header CTA stays on the page: the diagnostic form is right here.
wire('agendar-diagnostico', '#diagnostico')

// "Guías de IA" is a page the site does not have. A nav entry that resolves to
// nothing is worse than no entry, so it goes rather than being pointed at an
// unrelated section.
dropAnchor('Guías de IA')
dropAnchor('Guías de IA para PYMES')

// The three legal links all shared `data-path="aviso-legal"`. Only one of them
// corresponds to a page that exists.
dropAnchor('Términos de Servicio')
dropAnchor('Aviso Legal')
swap(
  'data-path="aviso-legal" href="#">Tratamiento de Datos Personales (Habeas Data)</a>',
  'href="/__LOCALE__/privacidad">Tratamiento de Datos Personales (Habeas Data)</a>',
)

// ---- Locale switcher ----
// Two inert <button>s in the export. They become real links that stay on this
// page, so switching language does not also lose the visitor's place.
swap(
  '<button class="px-2 py-1 font-label-sm text-label-sm rounded bg-primary-container text-on-primary-container font-semibold transition-all" type="button">ES</button>',
  '<a class="px-2 py-1 font-label-sm text-label-sm rounded bg-primary-container text-on-primary-container font-semibold transition-all" href="/es/calculadora-roi">ES</a>',
)
swap(
  '<button class="px-2 py-1 font-label-sm text-label-sm rounded text-on-surface-variant hover:text-on-surface transition-all" type="button">EN</button>',
  '<a class="px-2 py-1 font-label-sm text-label-sm rounded text-on-surface-variant hover:text-on-surface transition-all" href="/en/calculadora-roi">EN</a>',
)

// ---- Real contact details ----
/*
 * The comp shipped an invented corporate identity — a street address, a
 * support mailbox, a phone number and a tax ID (NIT) that belong to no one.
 * Publishing fabricated registration details is not a design decision, so
 * every one of them is replaced with the values in `src/lib/site.ts` or
 * dropped where the site has no equivalent.
 */
swap('Distrito Creativo El Poblado<br>Medellín, Antioquia, Colombia', 'Medellín, Antioquia, Colombia')
swap(
  '<a class="font-body-sm text-body-sm text-primary hover:text-on-primary-container transition-colors" href="#">contacto@numiai.co</a>',
  '<a class="font-body-sm text-body-sm text-primary hover:text-on-primary-container transition-colors" href="mailto:atencionnumi@gmail.com">atencionnumi@gmail.com</a>',
)
swap(
  '<a class="font-body-sm text-body-sm text-status-success hover:text-on-surface transition-colors" href="#">+57 (300) 840-9211 (WhatsApp)</a>',
  '<a class="font-body-sm text-body-sm text-status-success hover:text-on-surface transition-colors" href="https://wa.me/573127676549" rel="noopener noreferrer" target="_blank">+57 312 767 6549 (WhatsApp)</a>',
)
// Worded exactly like the home's, which needs no translation entry.
swap(
  '© 2025 Numi AI Colombia SAS. Todos los derechos reservados. NIT 901.782.443-1.',
  '© __YEAR__ Numi AI.',
)
swap(
  'Un especialista de Numi AI Medellín te contactará por WhatsApp para validar tu caso con los parámetros ingresados.',
  'Un especialista de Numi AI te contactará para validar tu caso con los parámetros ingresados.',
)
// No fixed call length anywhere on the site — see build-stitch-home.mjs.
swap('Agenda un diagnóstico financiero y técnico de 15 minutos.', 'Agenda un diagnóstico financiero y técnico.')
swap('Respuesta en menos de 10 minutos por WhatsApp.', 'Te respondemos por WhatsApp o correo.')
// Dated in the comp; the page is not re-exported every year.
swap('Ajustado al régimen laboral colombiano (2025/2026)', 'Ajustado al régimen laboral colombiano')

// ---- "Exportar PDF" ----
/*
 * The control only raised an `alert()` summarising the figures. A modal
 * dialog blocks the page, there is no PDF behind it, and a button that
 * promises a download and delivers a system dialog is worse than no button —
 * so it goes, and "Validar en llamada" takes the full width it leaves.
 */
swap(
  `<button class="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-label-lg text-label-lg text-on-surface hover:text-text-primary bg-surface-variant/80 hover:bg-surface-bright transition-all" id="btn-download-pdf" type="button">
<span class="material-symbols-outlined text-lg">download</span>
              Exportar PDF
            </button>
`,
  '',
)
swap(`      const btnDownloadPdf = document.getElementById('btn-download-pdf');\n`, '')
const pdfHandlerStart = html.indexOf('      // Export PDF Action')
const pdfHandlerEnd = html.indexOf('      // Accordion toggle')
if (pdfHandlerStart < 0 || pdfHandlerEnd < 0 || pdfHandlerEnd < pdfHandlerStart) {
  throw new Error('PDF handler block not found')
}
html = html.slice(0, pdfHandlerStart) + html.slice(pdfHandlerEnd)

// ---- Lead form ----
/*
 * `/api/contact` takes name, whatsapp, email and message; the comp asked for a
 * company name and an economic sector instead. The two-column row keeps its
 * shape and becomes email + message, so the form matches the endpoint that
 * already exists rather than adding a second lead schema to maintain.
 */
const fieldClass =
  'w-full px-4 py-3 rounded-xl bg-surface-elevated text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-text-muted'
const labelClass =
  'block font-label-sm text-label-sm text-text-secondary uppercase tracking-wider mb-1.5'

const companyAndSectorStart = html.indexOf('<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">')
const companyAndSectorEnd = html.indexOf('<button class="w-full mt-2 py-4 px-6 rounded-xl')
if (companyAndSectorStart < 0 || companyAndSectorEnd < 0) throw new Error('Form fields block not found')
html =
  html.slice(0, companyAndSectorStart) +
  `<div>
<label class="${labelClass}" for="lead-email">Correo electrónico</label>
<input class="${fieldClass}" id="lead-email" placeholder="tucorreo@empresa.com" required="" type="email">
</div>
<div>
<label class="${labelClass}" for="lead-message">Cuéntanos qué necesitas</label>
<textarea class="${fieldClass}" id="lead-message" minlength="10" placeholder="Cuéntanos cómo funciona tu negocio hoy y qué te gustaría automatizar" required="" rows="3"></textarea>
</div>
` +
  html.slice(companyAndSectorEnd)

// An error slot beside the success one, and no native validation popups until
// we have checked the form ourselves.
swap('<form class="space-y-4" id="lead-calculator-form">', '<form class="space-y-4" id="lead-calculator-form" novalidate>')
swap(
  '<div class="hidden p-6 rounded-xl bg-status-success/15',
  '<div class="hidden p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-on-surface text-center text-[13px] mt-3" id="form-error"></div>\n<div class="hidden p-6 rounded-xl bg-status-success/15',
)

// Same submit path as the home form: POST to /api/contact, remember the lead
// for the booking page, then hand off to /agendar.
const formScript = `
<script>
  (function () {
    var form = document.getElementById('lead-calculator-form');
    if (!form) return;
    var ok = document.getElementById('form-success-msg');
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
        ok.classList.remove('hidden');
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
swap('</body></html>', formScript + '</body></html>')

// ---- Decorative avatar ----
/*
 * The comp's header ends in a round "Profile" photo. The site has no accounts
 * to be signed in to, so it depicts a user that cannot exist — and it is
 * served from a temporary Stitch URL that has already expired, so keeping it
 * would ship a broken image as well as a false affordance.
 */
html = html.replace(/<img alt="Profile"[^>]*>/g, '')

// ---- Production assets ----
// 1. Logos: download Stitch's temporary googleusercontent images into /public as WebP
mkdirSync(new URL('../public/images/stitch/', import.meta.url), { recursive: true })
const imgUrls = [...new Set([...html.matchAll(/src="(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"/g)].map((m) => m[1]))]
for (const [i, url] of imgUrls.entries()) {
  const name = `roi-${i + 1}.webp`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Image download failed: ' + url)
  await sharp(Buffer.from(await res.arrayBuffer())).resize(128, 128, { fit: 'cover' }).webp({ quality: 90 })
    .toFile(fileURLToPath(new URL('../public/images/stitch/' + name, import.meta.url)))
  swap(url, '/images/stitch/' + name)
}

// 2. Material Symbols: request only the icons the page uses.
// The export links the family twice — the second, unsubsettable copy would
// pull the whole set back down and undo the subsetting below.
swap(
  '\n<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">',
  '',
)
const icons = [...new Set([...html.matchAll(/material-symbols-outlined[^"]*"[^>]*>([a-z_]+)</g)].map((m) => m[1]))].sort()
swap(
  'family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"',
  'family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&amp;icon_names=' + icons.join(',') + '&amp;display=block"',
)

// 3. Tailwind: compile at build time with the design's own config instead of the CDN
// The trailing semicolon is optional: the home export writes `};</script>`,
// this one writes `}</script>`, and without the `?` the lazy match runs past
// the config and swallows the page's own scripts.
const configMatch = html.match(/<script id="tailwind-config">\s*tailwind\.config = ([\s\S]*?);?\s*<\/script>/)
if (!configMatch) throw new Error('Tailwind config not found')
const twTheme = new Function('return ' + configMatch[1])()
// No trailing newline in this export, unlike the home one.
swap('<script src="https://cdn.tailwindcss.com"></script>', '')
swap(configMatch[0], '')
// Preload the text fonts so they arrive sooner
swap(
  '<link href="https://fonts.googleapis.com/css2?family=Inter',
  '<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Plus+Jakarta+Sans:wght@600;700;800&amp;display=swap">\n<link href="https://fonts.googleapis.com/css2?family=Inter',
)

// ---- English version ----
const en = JSON.parse(readFileSync(new URL('./stitch-roi-en.json', import.meta.url), 'utf8'))
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
  .replace('<a class="px-2 py-1 font-label-sm text-label-sm rounded bg-primary-container text-on-primary-container font-semibold transition-all" href="/es/calculadora-roi">ES</a>', '<a class="px-2 py-1 font-label-sm text-label-sm rounded text-on-surface-variant hover:text-on-surface transition-all" href="/es/calculadora-roi">ES</a>')
  .replace('<a class="px-2 py-1 font-label-sm text-label-sm rounded text-on-surface-variant hover:text-on-surface transition-all" href="/en/calculadora-roi">EN</a>', '<a class="px-2 py-1 font-label-sm text-label-sm rounded bg-primary-container text-on-primary-container font-semibold transition-all" href="/en/calculadora-roi">EN</a>')

/*
 * The simulator formats its own output with `toLocaleString('es-CO')`, so the
 * English page would still print Colombian separators. The figures stay in COP
 * — they describe a Colombian payroll and converting them would invent an
 * exchange rate — but the grouping follows the reader.
 */
htmlEn = htmlEn.split("'es-CO'").join("'en-US'")

const { css } = await postcss([
  tailwind({ ...twTheme, content: [{ raw: html + htmlEn, extension: 'html' }], plugins: [forms, containerQueries] }),
]).process('@tailwind base;\n@tailwind components;\n@tailwind utilities;', { from: undefined })
// Light minification: drop comments, collapse whitespace
const minCss = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};])\s*/g, '$1')
html = html.replace('<style>', '<style id="tw">' + minCss + '</style>\n<style>')
htmlEn = htmlEn.replace('<style>', '<style id="tw">' + minCss + '</style>\n<style>')
console.log('css bytes', minCss.length, 'icons', icons.length, 'images', imgUrls.length)
if (missing.size) console.warn('Unused translations:', [...missing])

writeFileSync(
  new URL('../src/app/[locale]/stitch-roi.ts', import.meta.url),
  '// AUTO-GENERATED by scripts/build-stitch-roi.mjs from the Stitch export. Do not edit by hand.\n' +
    'export const stitchRoiHtml = ' + JSON.stringify({ es: html, en: htmlEn }) + ' as const\n',
)
console.log('ok', html.length, htmlEn.length)
