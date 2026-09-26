/**
 * Chrome shared by every Stitch page: the header navigation and the booking
 * section.
 *
 * Both used to be written twice — once in each export — and they had already
 * drifted. The navs disagreed on how many links there were (seven against
 * six), on whether "Integraciones" existed, on what the FAQ link was called
 * ("Preguntas Frecuentes" against "FAQ") and on whether the links were plain
 * text or pills. The booking sections shared their four fields and their
 * endpoint but nothing else: different heading, different button, different
 * layout. A visitor moving between the two pages was being shown two
 * different sites.
 *
 * Everything here is generated from one definition and consumed by both build
 * scripts, so the pages cannot drift again: change it here and both rebuild
 * the same markup.
 */
import { readFileSync } from 'node:fs'

/** The home export is the source for the booking section's markup. */
const homeExport = readFileSync(new URL('../design/stitch/code.html', import.meta.url), 'utf8')
  .replace(/\r\n/g, '\n')

/*
 * Underline drawn on hover and on keyboard focus.
 *
 * A scaled pseudo-element rather than `underline`, so it grows from the left
 * and reserves no layout — a real underline toggling on hover would shift the
 * text baseline by its own thickness. `primary` (#d2bbff) measures about
 * 11:1 against the bar, where the export's only cue was a shift between two
 * greys 1.3:1 apart.
 */
const UNDERLINE =
  " relative after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:origin-left" +
  " after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform" +
  " after:duration-200 after:content-[''] hover:after:scale-x-100" +
  " focus-visible:after:scale-x-100 motion-reduce:after:transition-none"

const IDLE_LINK =
  'text-on-surface-variant hover:text-on-surface transition-all duration-200 text-[14px]' + UNDERLINE
const CURRENT_LINK =
  'transition-all duration-200 text-on-surface font-semibold hover:text-primary' + UNDERLINE

/**
 * One list, one order, one set of labels. `fragment` names a band of the home
 * page; `route` names a page of its own.
 */
export const NAV_ITEMS = [
  { key: 'home', label: 'Inicio', fragment: '' },
  { key: 'servicios', label: 'Servicios', fragment: '#servicios' },
  { key: 'proceso', label: 'Proceso', fragment: '#proceso' },
  { key: 'planes', label: 'Planes y Precios', fragment: '#planes' },
  { key: 'integraciones', label: 'Integraciones', fragment: '#integraciones' },
  { key: 'roi', label: 'Calculadora de ROI', route: '/calculadora-roi' },
  { key: 'faq', label: 'Preguntas Frecuentes', fragment: '#preguntas-frecuentes' },
]

/**
 * The header nav for one page.
 *
 * @param {'home' | 'roi'} current which page is being built
 */
export function nav(current) {
  const links = NAV_ITEMS.map((item) => {
    const isCurrent = item.key === current
    /*
     * A bare `#servicios` only resolves on the home page. Everywhere else the
     * fragment has to be preceded by a real navigation back to it, or the
     * link goes nowhere.
     */
    const href = item.route
      ? `/__LOCALE__${item.route}`
      : current === 'home'
        ? item.fragment || '#'
        : `/__LOCALE__${item.fragment}`

    return (
      `<a class="${isCurrent ? CURRENT_LINK : IDLE_LINK}"` +
      (isCurrent ? ' aria-current="page"' : '') +
      ` href="${href}">${item.label}</a>`
    )
  })

  return `<nav class="hidden lg:flex items-center gap-6">\n${links.join('\n')}\n</nav>`
}

/**
 * Escapes a translated string that is about to be written back into a
 * single-quoted JavaScript literal.
 *
 * The English copy is substituted into the page's own scripts by matching
 * `'...'` and replacing what is inside. Without this, the first apostrophe in
 * the replacement closes the literal: `showError('We couldn't send your
 * message.')` is a syntax error, and because these calls sit inside one IIFE
 * it took the whole form handler down with it. Both English pages shipped
 * that way — the contact form did nothing at all in English.
 */
export function escapeSingleQuoted(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

/** Finds the element of `tag` that encloses the first occurrence of `needle`. */
export function enclosing(html, needle, tag) {
  const at = html.indexOf(needle)
  if (at < 0) throw new Error('Not found: ' + needle)

  const start = html.lastIndexOf('<' + tag, at)
  if (start < 0) throw new Error('No enclosing <' + tag + '> for ' + needle)

  let depth = 0
  for (const token of html.slice(start).matchAll(new RegExp('<' + tag + '\\b|</' + tag + '>', 'g'))) {
    depth += token[0].startsWith('</') ? -1 : 1
    if (depth === 0) return { start, end: start + token.index + token[0].length }
  }
  throw new Error('Unbalanced <' + tag + '> around ' + needle)
}

/**
 * The booking section, `#contacto`, taken from the home export and made to
 * work: the comp's inline `onsubmit` only revealed a success message and
 * reset the form, so it is replaced by real validation and a slot to report
 * an error in.
 */
export function bookingSection() {
  const { start, end } = enclosing(homeExport, 'id="contacto"', 'section')
  let block = homeExport.slice(start, end)

  const onsubmit =
    ` onsubmit="event.preventDefault(); document.getElementById('form-feedback').classList.remove('hidden'); this.reset();"`
  if (!block.includes(onsubmit)) throw new Error('Contact form onsubmit not found')
  block = block.split(onsubmit).join(' novalidate')

  /*
   * No fixed call length anywhere on the site — the same correction the home
   * build makes to the rest of the page. It has to be repeated here because
   * this block is taken from the untouched export, not from the page being
   * built, which is also what keeps the two pages identical.
   */
  for (const [from, to] of [
    ['agendar tu llamada estratégica de 15 minutos.', 'agendar tu llamada estratégica.'],
    [
      'Llamada de 15 minutos sin costo. Diagnóstico de viabilidad.',
      'Llamada sin costo. Diagnóstico de viabilidad.',
    ],
  ]) {
    if (!block.includes(from)) throw new Error('Not found in booking section: ' + from)
    block = block.split(from).join(to)
  }

  const successOpen = '<div class="hidden p-4 rounded-xl bg-status-success/20'
  if (!block.includes(successOpen)) throw new Error('Success slot not found')
  block = block.split(successOpen).join(
    '<div class="hidden p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-on-surface text-center text-[13px] mt-3" id="form-error"></div>\n' +
      successOpen,
  )

  return block
}

/**
 * The custom CSS the booking section depends on.
 *
 * Two of its classes — the glass panel and the primary button — are not
 * Tailwind utilities but hand-written rules in the home export's own
 * stylesheet. Moving the markup without them left the ROI page rendering the
 * submit button as unstyled text on no background, which is the failure mode
 * of copying markup across documents: the class names survive, the rules that
 * give them meaning do not.
 */
export function bookingStyles() {
  const css = [...homeExport.matchAll(/<style(?![^>]*id="tw")[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1])
    .join('\n')

  const needed = ['liquid-glass-surface', 'apple-liquid-btn-primary']
  // The rules are flat — no nesting — so splitting after each closing brace
  // yields one rule per entry.
  const rules = css.split(/(?<=\})/).filter((rule) => needed.some((cls) => rule.includes('.' + cls)))

  for (const cls of needed) {
    if (!rules.some((rule) => rule.includes('.' + cls + ' ') || rule.includes('.' + cls + '{') || rule.includes('.' + cls + ':') || rule.includes('.' + cls + '\n'))) {
      throw new Error('No rule found for .' + cls)
    }
  }

  return rules.map((rule) => rule.trim()).join('\n')
}

/**
 * The submit handler for that section. Posts to `/api/contact`, remembers the
 * lead so the booking page can prefill itself, then hands off to `/agendar`.
 */
export const bookingScript = `
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
