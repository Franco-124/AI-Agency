// Regenerates src/app/[locale]/stitch-home.ts from the Stitch export.
// Run: node scripts/build-stitch-home.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'
import tailwind from 'tailwindcss3'
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

let html = readFileSync(new URL('../design/stitch/code.html', import.meta.url), 'utf8')

const swap = (from, to) => {
  if (!html.includes(from)) throw new Error('Not found: ' + from.slice(0, 80))
  html = html.split(from).join(to)
}

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
swap('</body></html>', formScript + '</body></html>')


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

writeFileSync(
  new URL('../src/app/[locale]/stitch-home.ts', import.meta.url),
  '// AUTO-GENERATED by scripts/build-stitch-home.mjs from the Stitch export. Do not edit by hand.\n' +
    'export const stitchHomeHtml = ' + JSON.stringify({ es: html, en: htmlEn }) + ' as const\n',
)
console.log('ok', html.length, htmlEn.length)
