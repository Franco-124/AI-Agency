// Regenerates src/app/[locale]/stitch-home.ts from the Stitch export.
// Run: node scripts/build-stitch-home.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'
import tailwind from 'tailwindcss3'
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

/*
 * Normalised to LF on read. Git checks the export out with CRLF on Windows,
 * and every literal newline in the swaps below is a bare \n — without this the
 * script throws "Not found" on whichever machine has the other line ending,
 * which is exactly what it did the first time it ran on a fresh clone.
 */
let html = readFileSync(new URL('../design/stitch/code.html', import.meta.url), 'utf8').replace(
  /\r\n/g,
  '\n',
)

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
/*
 * ROI calculator. The comp already listed it under "Recursos" in the footer,
 * pointing at `#` — that dead link is now the real page. The header gets an
 * entry of its own beside the section anchors, because the calculator is the
 * one destination in the nav that is not a band of this page, and a visitor
 * who wants to price the thing should not have to reach the footer first.
 */
swap(
  '<a class="hover:text-primary transition-colors" href="#">Calculadora de ROI</a>',
  '<a class="hover:text-primary transition-colors" href="/__LOCALE__/calculadora-roi">Calculadora de ROI</a>',
)
swap(
  '<a class="text-on-surface-variant hover:text-on-surface transition-all duration-200 text-[14px]" href="#preguntas-frecuentes">Preguntas Frecuentes</a>',
  '<a class="text-on-surface-variant hover:text-on-surface transition-all duration-200 text-[14px]" href="/__LOCALE__/calculadora-roi">Calculadora de ROI</a>\n' +
    '<a class="text-on-surface-variant hover:text-on-surface transition-all duration-200 text-[14px]" href="#preguntas-frecuentes">Preguntas Frecuentes</a>',
)
/*
 * The floating "Hablar con Asesor" button already opened WhatsApp, but it did
 * not look like WhatsApp: a generic Material "chat" bubble on the design
 * system's emerald (#10B981). A green pill that is not WhatsApp green, with a
 * speech bubble that is not the WhatsApp mark, makes the visitor read the
 * destination rather than recognise it — and recognition is the whole reason
 * a FAB like this works.
 *
 * It now carries the official mark and #25D366. The glyph is the one the
 * site's own `WhatsAppFab` component used before the redesign removed it, so
 * this is the project's existing asset rather than a new drawing.
 */
swap(
  `<a aria-label="Chat en WhatsApp con Numi AI" class="flex items-center gap-2 px-4 py-3 rounded-full bg-status-success text-white text-[14px] shadow-[0_8px_24px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all font-semibold" href="https://wa.me/573127676549" target="_blank">
<span class="material-symbols-outlined text-[22px]">chat</span>`,
  `<a aria-label="Chat en WhatsApp con Numi AI" class="flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white text-[14px] shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:bg-[#1DB954] hover:scale-105 active:scale-95 transition-all font-semibold" href="https://wa.me/573127676549" rel="noopener noreferrer" target="_blank">
<svg aria-hidden="true" class="w-[22px] h-[22px] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"></path><path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.98.573 3.827 1.563 5.383L2 22l4.735-1.539A9.953 9.953 0 0 0 12.001 22C17.523 22 22 17.522 22 12S17.523 2 12.001 2zm0 18.13a8.12 8.12 0 0 1-4.14-1.135l-.297-.176-3.07.998.996-3.07-.187-.309A8.13 8.13 0 1 1 20.13 12a8.14 8.14 0 0 1-8.129 8.13z"></path></svg>`,
)

/*
 * Header nav: an underline on hover and on keyboard focus.
 *
 * The only hover affordance was a shift from `on-surface-variant` (#ccc3d8)
 * to `on-surface` (#e4e1ed) — two greys eight per cent apart, which on a dark
 * bar is not a state change anyone registers, and is invisible to a visitor
 * who cannot distinguish them. The rule is drawn in `primary` (#d2bbff),
 * which sits at roughly 11:1 against the header, so the target is obvious
 * rather than merely implied.
 *
 * It is a scaled pseudo-element rather than `underline`, so it grows from the
 * left instead of appearing, and it reserves no layout — a real underline
 * toggling on hover would shift the text baseline by the rule's thickness.
 * `focus-visible` gets the same treatment: a hover-only cue leaves keyboard
 * users with no indication of where they are.
 */
const navUnderline =
  " relative after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:origin-left" +
  " after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform" +
  " after:duration-200 after:content-[''] hover:after:scale-x-100" +
  " focus-visible:after:scale-x-100 motion-reduce:after:transition-none"

swap(
  'class="text-on-surface-variant hover:text-on-surface transition-all duration-200 text-[14px]"',
  'class="text-on-surface-variant hover:text-on-surface transition-all duration-200 text-[14px]' +
    navUnderline +
    '"',
)
swap(
  'class="transition-all duration-200 text-on-surface font-semibold hover:text-primary"',
  'class="transition-all duration-200 text-on-surface font-semibold hover:text-primary' +
    navUnderline +
    '"',
)

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
