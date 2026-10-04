// Regenerates src/app/[locale]/stitch-roi.ts from the Stitch "Calculadora de
// ROI" export, the same way scripts/build-stitch-home.mjs does for the home.
// Run: node scripts/build-stitch-roi.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'
import tailwind from 'tailwindcss3'
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

import { bookingScript, bookingSection, bookingStyles, enclosing, escapeSingleQuoted, nav, selfHostFonts } from './stitch-chrome.mjs'

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
/*
 * The export shipped its own nav — six pill-shaped links, a different set from
 * the home's seven, calling the FAQ "FAQ" and omitting "Integraciones". It is
 * replaced wholesale by the shared one, so both pages present the same header.
 * This runs before the wiring below, which then only has the footer's anchors
 * left to fix.
 */
{
  const { start, end } = enclosing(html, '<nav class="hidden xl:flex', 'nav')
  html = html.slice(0, start) + nav('roi') + html.slice(end)
}

// The export's remaining chrome links nowhere (`href="#"` throughout).
/*
 * The export's footer listed services and resources the business does not
 * offer ("Agentes Autónomos", "Entrenamiento de Equipos", a "Sprint 4-Step"
 * method that contradicts the home's 10–20 business days). It now names the
 * home's own five services and points the rest at real sections.
 */
{
  const anchor = (text) => `<a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="servicios" href="#">${text}</a>`
  const before = ['Auditoría de Procesos', 'Agentes Autónomos', 'Automatización CRM', 'Entrenamiento de Equipos'].map(anchor).join('')
  if (!html.includes(before)) throw new Error('ROI footer services markup changed')
  html = html.replace(
    before,
    ['Diagnóstico de procesos', 'Chatbots Inteligentes', 'Automatización de procesos', 'Agentes de IA Cognitivos', 'Sitios web profesionales'].map(anchor).join(''),
  )
}
swap('data-path="proceso" href="#">Metodología Sprint 4-Step</a>', 'data-path="proceso" href="#">Proceso</a>')
swap('data-path="planes-y-precios" href="#">Planes de Suscripción</a>', 'data-path="planes-y-precios" href="#">Planes</a>')

wire('servicios', '/__LOCALE__#servicios')
wire('proceso', '/__LOCALE__#proceso')
wire('planes-y-precios', '/__LOCALE__#planes')
wire('faq', '/__LOCALE__#preguntas-frecuentes')
wire('calculadora-de-roi', '/__LOCALE__/calculadora-roi')
// The header CTA stays on the page: the booking section is right here.
wire('agendar-diagnostico', '#contacto')

// "Guías de IA" is a page the site does not have. A footer entry that resolves
// to nothing is worse than no entry, so it goes rather than being pointed at
// an unrelated section.
dropAnchor('Guías de IA para PYMES')

// The three legal links all shared `data-path="aviso-legal"`. Each now goes
// to its own page: terms, the data policy, and the cookie policy in place of
// the comp's "Aviso Legal", which the site has no separate document for.
swap(
  'data-path="aviso-legal" href="#">Términos de Servicio</a>',
  'href="/__LOCALE__/terminos">Términos y Condiciones</a>',
)
swap(
  'data-path="aviso-legal" href="#">Tratamiento de Datos Personales (Habeas Data)</a>',
  'href="/__LOCALE__/privacidad">Tratamiento de Datos Personales (Habeas Data)</a>',
)
swap(
  'data-path="aviso-legal" href="#">Aviso Legal</a>',
  'href="/__LOCALE__/cookies">Política de Cookies</a>',
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

/*
 * The figures are an estimate built on general payroll assumptions, and the
 * page must not read as accounting or labor advice. Said next to the result
 * rather than only in the terms, because that is where the number is read.
 */
swap(
  '<span class="">Sin contratos forzosos. Cumplimiento de Ley 1581 Habeas Data.</span>\n</div>',
  '<span class="">Sin contratos forzosos. Cumplimiento de Ley 1581 Habeas Data.</span>\n</div>\n<p class="mt-3 text-center text-[11px] leading-relaxed text-text-muted">Estimación ilustrativa; no es asesoría contable, laboral ni tributaria. <a class="underline underline-offset-2 hover:text-on-surface" href="#fuentes">Supuestos y fuentes</a> · <a class="underline underline-offset-2 hover:text-on-surface" href="/__LOCALE__/terminos">Términos</a></p>',
)
// No fixed call length anywhere on the site — see build-stitch-home.mjs.
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

// ---- Payroll model ----
/*
 * The comp's arithmetic was a year out of date and rested on a number that
 * does not exist. Everything in this block is sourced:
 *
 * - SMLV 2026 is $1.750.905 and the transport allowance $249.095 (Decreto
 *   1469 de 2025; briefly suspended, restated by Decreto 159 de 2026, back in
 *   force once the suspension was lifted). The slider started at $1.423.500,
 *   which is the 2025 figure, and the allowance was missing entirely although
 *   it is mandatory up to 2 SMLV — most of the slider's range — and counts
 *   towards the prima and cesantías base.
 * - There is no "53% factor prestacional". Computed line by line the employer
 *   load runs from +55% at the minimum wage down to +38% above 2 SMLV, where
 *   the allowance stops. A flat multiplier understates the bottom of the
 *   range and overstates the top by about 15%.
 * - Whether the employer is exonerated from health, SENA and ICBF (art. 114-1
 *   E.T.) moves the result by 13.5 points, so the visitor now says which case
 *   they are in instead of the page guessing.
 * - A working month is 182 hours since the 42-hour week completed in July
 *   2026, so the panel says when a scenario would not fit in the staff the
 *   visitor set, rather than silently dividing payroll by impossible work.
 */
swap(
  '<p class="text-xs text-text-muted mt-0.5">+53% estimado de factor prestacional legal colombiano</p>',
  '<p class="text-xs text-text-muted mt-0.5">Incluye auxilio de transporte, seguridad social, parafiscales y prestaciones (vigencia 2026)</p>',
)
swap(
  '<input class="w-full accent-primary bg-surface-variant h-2 rounded-lg cursor-pointer" id="slider-salary" max="4500000" min="1423500" step="50000" type="range" value="2200000">',
  '<input class="w-full accent-primary bg-surface-variant h-2 rounded-lg cursor-pointer" id="slider-salary" max="5250905" min="1750905" step="50000" type="range" value="2750905">',
)
swap(
  `<span class="">SMLV ($1.423.500)</span>
<span class="">Técnico ($2.2M)</span>
<span class="">Especializado ($4.5M)</span>
</div>`,
  `<span class="">SMLV ($1.750.905)</span>
<span class="">Técnico ($2.750.905)</span>
<span class="">Especializado ($5.250.905)</span>
</div>
<label class="flex items-start gap-3 mt-4 pt-4 border-t border-white/10 cursor-pointer">
<input checked class="mt-0.5 w-4 h-4 accent-primary shrink-0" id="chk-exonerada" type="checkbox">
<span class="text-xs text-text-muted leading-relaxed">Mi empresa está exonerada de salud, SENA e ICBF (art. 114-1 E.T.: sociedades y personas naturales con dos o más empleados, por quienes ganen menos de 10 SMLV)</span>
</label>`,
)
swap(
  '<!-- CTAs -->',
  `<p class="hidden mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200" id="capacity-note"></p>
<!-- CTAs -->`,
)
swap(
  'En Colombia, un trabajador devenga su salario base más un factor prestacional legal aproximado del <strong>52% al 54%</strong> (cesantías, primas de servicios, vacaciones, aportes a salud, pensión, ARL y caja de compensación). Nuestro simulador computa la carga patronal completa que tu empresa realmente asume.',
  'Sobre el salario base el empleador paga prima, cesantías, intereses sobre cesantías, vacaciones, pensión, ARL y caja de compensación, más el auxilio de transporte de <strong>$249.095</strong> hasta dos salarios mínimos. No es un porcentaje fijo: sumado partida por partida va del <strong>+55% en el mínimo al +38% por encima de dos SMLV</strong>, y sube 13,5 puntos más si tu empresa no está exonerada de salud, SENA e ICBF. El simulador lo calcula así, no con un multiplicador.',
)
swap(
  'Ajustado al régimen laboral colombiano',
  'SMLV 2026 ($1.750.905) y auxilio de transporte incluidos',
)
swap(
  'Disponibilidad 24/7 sin recargo nocturno',
  'Sin recargo nocturno (7:00 p.m.) ni dominical (+90%)',
)

/*
 * "480% en el año 1" sat under the ROI multiple as fixed text, so at 29.4x it
 * still claimed 480%. It is the same number said twice, and now it is derived
 * from the multiple rather than typed beside it.
 */
swap(
  '<span class="text-[11px] text-text-muted font-body-sm">480% en el año 1</span>',
  '<span class="text-[11px] text-text-muted font-body-sm"><span id="out-roi-percent">430</span>% en el año 1</span>',
)
swap(
  `      const outPayback = document.getElementById('out-payback');`,
  `      const outPayback = document.getElementById('out-payback');
      const outRoiPercent = document.getElementById('out-roi-percent');`,
)
swap(
  `        outRoiMultiple.textContent = roi + 'x';`,
  `        outRoiMultiple.textContent = roi + 'x';
        outRoiPercent.textContent = Math.round((parseFloat(roi) - 1) * 100).toLocaleString('es-CO');`,
)

// The WhatsApp cost answer described a pricing model Meta has replaced.
swap(
  'Meta cobra tarifas fijas por conversación (ventana de 24 horas) en la API oficial de WhatsApp Cloud. Para Colombia, las conversaciones de servicio iniciadas por el usuario tienen un costo marginal (aproximadamente $0.015 USD o ~$60 COP). Al consolidar cientos de mensajes bajo una sola ventana de 24 horas, el costo por interacción sigue siendo 15 a 20 veces más económico que pagar minutos hombre de atención manual.',
  // Checked against Meta's pricing page (updated 10 Sep 2026): per-message
  // pricing since 1 Jul 2025; from 1 Oct 2026 service messages are charged at
  // the utility rate, with 1.000 free a month per number.
  'Menos de lo que se suele creer. Desde el 1 de julio de 2025 Meta cobra por mensaje entregado, y desde el 1 de octubre de 2026 también cobra las respuestas de servicio —las que envías dentro de las 24 horas después de que el cliente te escribe— con la misma tarifa de utilidad, con 1.000 gratis al mes por número. En Colombia esa tarifa ronda los US$0,0008 por mensaje (unos $3 COP) y la de marketing unos US$0,0125. La mensajería es marginal en la ecuación; lo que se paga es la plataforma y la implementación. Las tarifas vigentes están en la página de precios de Meta.',
)

// New element handles, alongside the ones the export already grabs.
swap(
  `      const btnReset = document.getElementById('btn-reset');`,
  `      const btnReset = document.getElementById('btn-reset');
      const chkExonerada = document.getElementById('chk-exonerada');
      const capacityNote = document.getElementById('capacity-note');`,
)

// The employer-cost half of `calculate()`, replaced in place.
swap(
  `        // Burden calculation (53% Colombian Prestational Factor)
        const loadedMonthlyCostPerPerson = baseSalary * 1.53;
        valSalaryLoaded.textContent = 'Costo empresa: ~' + formatCOP(loadedMonthlyCostPerPerson) + ' COP';`,
  `        // Employer cost, line by line (CST + art. 114-1 E.T., vigencia 2026)
        const SMLV_2026 = 1750905;
        const AUXILIO_TRANSPORTE = 249095;
        // Mandatory up to two minimum wages. Not part of the contribution
        // base, but it does count towards prima and cesantías.
        const auxilio = baseSalary <= 2 * SMLV_2026 ? AUXILIO_TRANSPORTE : 0;
        const basePrestacional = baseSalary + auxilio;
        let loadedMonthlyCostPerPerson =
          baseSalary +
          auxilio +
          baseSalary * 0.12 +          // pensión
          baseSalary * 0.00522 +       // ARL, riesgo I
          baseSalary * 0.04 +          // caja de compensación
          basePrestacional * 0.0833 +  // prima de servicios
          basePrestacional * 0.0833 +  // cesantías
          basePrestacional * 0.01 +    // intereses sobre cesantías
          baseSalary * 0.0417;         // vacaciones
        if (chkExonerada && !chkExonerada.checked) {
          // Salud 8.5% + SENA 2% + ICBF 3%
          loadedMonthlyCostPerPerson += baseSalary * 0.135;
        }
        const factorPct = Math.round((loadedMonthlyCostPerPerson / baseSalary - 1) * 100);
        valSalaryLoaded.textContent =
          'Costo empresa: ~' + formatCOP(loadedMonthlyCostPerPerson) + ' COP (+' + factorPct + '%)';`,
)

// Capacity check, appended where the hours are already known.
swap(
  `        outHoursBefore.textContent = totalHoursPerMonth + 'h/mes';`,
  `        // A working month is 182 hours since the 42-hour week completed in
        // July 2026 (Ley 2101 de 2021). Past that the scenario is not a
        // staffing cost, it is work that nobody is doing.
        const asesoresNecesarios = Math.ceil(totalHoursPerMonth / 182);
        if (asesoresNecesarios > staffCount) {
          capacityNote.textContent =
            'Con ' + staffCount + (staffCount === 1 ? ' asesor' : ' asesores') +
            ' esta carga no cabe en la jornada legal de 42 h/semana: requeriría ' +
            asesoresNecesarios + ' personas.';
          capacityNote.classList.remove('hidden');
        } else {
          capacityNote.classList.add('hidden');
        }

        outHoursBefore.textContent = totalHoursPerMonth + 'h/mes';`,
)

swap(
  `      sliderSalary.addEventListener('input', calculate);`,
  `      sliderSalary.addEventListener('input', calculate);
      if (chkExonerada) chkExonerada.addEventListener('change', calculate);`,
)

swap(
  `        sliderSalary.value = 2200000;`,
  `        sliderSalary.value = 2750905;
        if (chkExonerada) chkExonerada.checked = true;`,
)

// ---- Benefit model: only what a source backs ----
/*
 * The export's benefit side could not be defended if anyone asked where a
 * number came from, and some of it was rigged:
 *
 * - `Math.max(18000000, …)`, `Math.max(2.4, …)` and `Math.max(24, …)` put a
 *   floor under the net saving, the ROI and the payback, so the page showed a
 *   profit even for a business that would lose money. Publishing that is the
 *   textbook case of misleading advertising (Ley 1480 de 2011, art. 30).
 * - Payroll saving was 65% of the whole team's payroll, whatever the chat
 *   volume — ten reps on forty chats a day "saved" six and a half salaries.
 * - "Sales recovered" multiplied three invented factors (12%, 45%, 8%).
 * - The technology cost ($15–19M a year) matched none of the real plans, and
 *   the $190 per chat afterwards was a constant.
 *
 * What replaces it, each figure with its source (the page lists them under
 * "Supuestos y fuentes"):
 *
 * - 4.5 min of a person's time per chat: deliberately below the 8–10 min that
 *   live-chat benchmarks measure (LiveChat Customer Service Report; Comm100),
 *   because WhatsApp questions to a small business are shorter.
 * - 65% of chats resolved without a person: roughly the two thirds Klarna
 *   reported for its AI assistant (press release, 27 Feb 2024) and the 67%
 *   average Intercom published for Fin (2025).
 * - Time freed is valued at the loaded cost per hour of the reps entered,
 *   over the 182-hour legal month, and never exceeds the hours those reps
 *   actually have.
 * - Cost: an internal reference cost per plan (Esencial $999.990 +
 *   $299.000/month, Avanzado $1.500.000 + $399.000/month). Prices are no
 *   longer published — every client is quoted individually — so the page
 *   presents this as a typical-implementation reference, not a price list.
 *   Plus Meta's messaging — from 1 Oct 2026
 *   service messages are charged at the utility rate (~US$0,0008 ≈ $3 COP in
 *   Colombia) after 1.000 free a month per number; four business replies per
 *   chat is assumed.
 * - No sales uplift is added: no source gives a conversion lift we could
 *   apply to a visitor's own ticket, so the ticket selector goes too.
 */
swap(
  `        const hoursAfter = Math.max(12, Math.round(totalHoursPerMonth * 0.12)); // 88% reduction`,
  `        // Share of chats the AI resolves without a person (Klarna 2024: two
        // thirds; Intercom Fin 2025: 67%).
        const AUTOMATION_RATE = 0.65;
        const hoursAfter = Math.round(totalHoursPerMonth * (1 - AUTOMATION_RATE));`,
)
swap(
  `        outHoursAfter.textContent = hoursAfter + 'h/mes (-88%)';`,
  `        outHoursAfter.textContent = hoursAfter + 'h/mes (-65%)';`,
)
swap(
  `        // Cost per chat before: Staff total monthly loaded payroll divided by monthly chats
        const totalMonthlyPayroll = loadedMonthlyCostPerPerson * staffCount;
        const costBeforePerChat = Math.round(totalMonthlyPayroll / monthlyChats);
        outCostChatBefore.textContent = formatCOP(Math.max(1800, costBeforePerChat)) + ' COP';

        // Cost after with Numi AI: Approx 190 COP
        outCostChatAfter.textContent = '$190 COP';

        // Saved Payroll: 65% of dedicated time can be repurposed or deferred from hiring
        const annualPayrollSavings = (totalMonthlyPayroll * 0.65) * 12;

        // Rescued Sales Opportunity:
        // Monthly potential leads lost = monthlyChats * 0.15 (leads portion) * lossRate
        const leadsRescuedMonthly = (monthlyChats * 0.12) * (currentLossRate * 0.45);
        const monthlySalesRecovery = leadsRescuedMonthly * (currentTicket * 0.08); // conservative conversion
        const annualSalesRecovery = monthlySalesRecovery * 12;

        // Total gross annual economic benefit
        const totalAnnualBenefit = annualPayrollSavings + annualSalesRecovery;

        // Technology cost estimate (Implementation + Monthly fee)
        const estimatedTechAnnualCost = 6800000 + (staffCount > 3 ? 12000000 : 8400000);
        const netAnnualSaving = Math.max(18000000, totalAnnualBenefit - estimatedTechAnnualCost);

        // Display results
        outAnnualSaving.textContent = formatCOP(netAnnualSaving) + ' COP';

        const roi = Math.max(2.4, (totalAnnualBenefit / estimatedTechAnnualCost)).toFixed(1);
        outRoiMultiple.textContent = roi + 'x';
        outRoiPercent.textContent = Math.round((parseFloat(roi) - 1) * 100).toLocaleString('es-CO');

        // Payback calculation in days
        const paybackDays = Math.max(24, Math.round((estimatedTechAnnualCost / (totalAnnualBenefit / 365))));
        outPayback.textContent = paybackDays + ' días';`,
  `        // Loaded cost of one hour of a rep, over the 182-hour legal month.
        const costPerHour = loadedMonthlyCostPerPerson / 182;

        // Plan by team size; internal reference cost of a typical
        // implementation (not a published price). Meta charges service messages
        // at the utility rate (~$3 COP) after 1.000 free a month per number;
        // four business replies per chat.
        const plan = staffCount > 3
          ? { setup: 1500000, monthly: 399000 }
          : { setup: 999990, monthly: 299000 };
        const metaMonthly = Math.max(0, monthlyChats * 4 - 1000) * 3;

        const costBeforePerChat = (4.5 / 60) * costPerHour;
        const costAfterPerChat = (hoursAfter * costPerHour + plan.monthly + metaMonthly) / monthlyChats;
        outCostChatBefore.textContent = formatCOP(costBeforePerChat) + ' COP';
        outCostChatAfter.textContent = formatCOP(costAfterPerChat) + ' COP';

        // Only hours the team really has can be freed.
        const hoursSaved = Math.min(totalHoursPerMonth - hoursAfter, staffCount * 182);
        const totalAnnualBenefit = hoursSaved * costPerHour * 12;
        const estimatedTechAnnualCost = plan.setup + (plan.monthly + metaMonthly) * 12;
        const netAnnualSaving = totalAnnualBenefit - estimatedTechAnnualCost;

        outAnnualSaving.textContent = (netAnnualSaving < 0 ? '-' : '') + formatCOP(Math.abs(netAnnualSaving)) + ' COP';

        const roi = (totalAnnualBenefit / estimatedTechAnnualCost).toFixed(1);
        outRoiMultiple.textContent = roi + 'x';
        outRoiPercent.textContent = Math.round((parseFloat(roi) - 1) * 100).toLocaleString('es-CO');

        // Days of benefit needed to cover the first year's cost.
        const paybackDays = totalAnnualBenefit > 0
          ? Math.round(estimatedTechAnnualCost / (totalAnnualBenefit / 365))
          : Infinity;
        outPayback.textContent = paybackDays > 365 ? 'Más de 1 año' : paybackDays + ' días';`,
)

// The ticket selector only fed the removed sales estimate.
{
  const inner = enclosing(html, 'Ticket promedio de venta o servicio (COP)', 'div')
  const start = html.lastIndexOf('<div', inner.start - 1)
  let depth = 0
  let end = -1
  for (const token of html.slice(start).matchAll(/<div\b|<\/div>/g)) {
    depth += token[0].startsWith('</') ? -1 : 1
    if (depth === 0) {
      end = start + token.index + token[0].length
      break
    }
  }
  const block = html.slice(start, end)
  if (end < 0 || !block.includes('id="ticket-group"') || block.includes('id="slider-')) {
    throw new Error('Ticket block boundaries changed')
  }
  html = html.slice(0, start) + html.slice(end)
}

// A booking/close-rate lift nobody measured.
{
  const { start, end } = enclosing(html, 'Tasa de agendamiento/cierre', 'div')
  html = html.slice(0, start) + html.slice(end)
}

// ---- Claims: sourced, or gone ----
// Nobody audits these figures; they are an estimate, and the badge says so.
swap('text-status-success text-xs font-semibold">Auditado</span>', 'text-status-success text-xs font-semibold">Estimado</span>')
swap(
  'Nuestro algoritmo de cálculo se rige bajo normatividad contable y laboral colombiana y datos reales de conversión.',
  'El cálculo sigue la normatividad laboral colombiana y usa supuestos con fuente pública, que listamos abajo.',
)
swap('SIMULADOR FINANCIERO Y OPERATIVO · NUMI AI BENCHMARK 2026', 'SIMULADOR FINANCIERO Y OPERATIVO · NUMI AI')
swap(
  'Descubre en 60 segundos el retorno de inversión real al implementar',
  'Estima en 60 segundos el retorno de inversión de implementar',
)
swap('Respuesta promedio: <strong>3 segundos</strong>', 'Responde en <strong>segundos</strong>, 24/7')
swap('<span class="text-status-success">3 segundos (24/7)</span>', '<span class="text-status-success">Segundos (24/7)</span>')
swap(
  '<p class="text-xs text-text-muted mb-6">Ahorro consolidado en nómina operativa + leads rescatados fuera de horario.</p>',
  '<p class="text-xs text-text-muted mb-6">Tiempo de atención liberado menos el costo del plan y la mensajería. No incluye ventas adicionales.</p>',
)
// The deflection ring: 88% had no source; two thirds does.
swap('stroke-dasharray="88, 100"', 'stroke-dasharray="65, 100"')
swap('<span class="absolute font-headline-sm text-sm font-bold text-text-primary">88%</span>', '<span class="absolute font-headline-sm text-sm font-bold text-text-primary">65%</span>')
swap('>Tasa de Descompresión</span>', '>Chats resueltos por la IA</span>')
swap(
  'El 88% de los chats entrantes se resuelven de punta a punta sin requerir intervención humana.',
  'En casos publicados, la IA resolvió cerca de dos tercios de los chats sin una persona (Klarna, 2024; Intercom, 2025). El simulador usa 65%.',
)
// Pilar 02 credited Velocify's 391% to Harvard Business Review. HBR's own
// finding is the "nearly 7 times" one (Oldroyd, McElheran y Elkington, 2011).
swap(
  'Según el estudio de Harvard Business Review y benchmarks regionales de comercio conversacional, las probabilidades de calificar un prospecto decaen un <strong>391% si se responde después del primer minuto</strong>. Cada hora de demora en WhatsApp representa un cliente que ya cotizó con tu competidor directo.',
  'Según Harvard Business Review (2011), las empresas que responden a un prospecto dentro de la primera hora tienen <strong>casi 7 veces más probabilidad de calificarlo</strong> que las que tardan más. Cada hora de demora en WhatsApp es tiempo para que el cliente cotice con otro.',
)
swap(
  '<span class="">Tasa de rescate</span>\n<span class="font-semibold text-status-success">+35% conversión en horario nocturno</span>',
  '<span class="">Fuente</span>\n<span class="font-semibold text-status-success">Harvard Business Review, 2011</span>',
)
swap('Handoff Eficiente 80 / 20', 'Handoff eficiente')
swap(
  'Numi AI no busca reemplazar el juicio comercial experto de tu equipo, sino eliminar las 140 preguntas idénticas que reciben sobre horarios, catálogos, direcciones y precios. El agente cognitivo filtra y ageda; tus asesores solo intervienen en el 20% de leads calificados listos para pagar.',
  'Numi AI no busca reemplazar el criterio comercial de tu equipo, sino responder las preguntas repetitivas sobre horarios, catálogo, direcciones y precios. El agente filtra y agenda; tus asesores intervienen en los casos que requieren criterio o que ya están listos para comprar.',
)
swap(
  '<span class="font-semibold text-text-primary">&gt; 140 horas / asesor / mes</span>',
  '<span class="font-semibold text-text-primary">Según tus datos, arriba</span>',
)
swap('suele pagar la totalidad de la mensualidad', 'puede pagar la mensualidad')
/*
 * The "guarantee" promised a 14-day sprint, a "Shadow Mode" and a 60%
 * reduction or a free recalibration — terms that exist in no contract, and
 * that contradict the home (10 to 20 business days, cancel with 30 days'
 * notice). An advertised guarantee binds the advertiser (Ley 1480, arts. 7
 * and 29), so the answer now states only what the home already commits to.
 */
swap('¿Ofrecen garantía o periodo de validación de resultados?', '¿Qué pasa si no me funciona?')
swap(
  "Absolutamente. Trabajamos bajo un Sprint de Implementación de 14 días. Antes del despliegue en producción masivo, realizamos una fase de pruebas 'Shadow Mode' donde la IA sugiere respuestas a tus asesores y comparamos la precisión. Si al término de los primeros 30 días en vivo el sistema no ha reducido al menos el 60% del tiempo de atención repetitiva, recalibramos sin costo o cancelas el servicio.",
  'La implementación toma entre 10 y 20 días hábiles e incluye pruebas hasta que el sistema funcione; nada sale a producción sin tu aprobación. No hay permanencia mínima: cancelas cuando quieras avisando con 30 días de anticipación, y te entregamos tus datos.',
)

// ---- Sources ----
// Every assumption the simulator uses, where a reader can check it.
swap(
  '<!-- SECTION 4: CASE STUDIES (COLOMBIAN ENTERPRISES) -->',
  `<section class="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pb-16 w-full" id="fuentes">
<h2 class="font-headline-sm text-headline-sm text-text-primary mb-4">Supuestos y fuentes</h2>
<ul class="space-y-2 text-sm text-text-secondary leading-relaxed list-disc pl-5">
<li class="">Nómina: SMLV y auxilio de transporte 2026, aportes, parafiscales y prestaciones según la ley colombiana; mes laboral de 182 horas por la jornada de 42 horas semanales (Ley 2101 de 2021).</li>
<li class="">Tiempo por chat: 4,5 minutos, por debajo de los 8 a 10 minutos que miden los reportes de chat en vivo (<a class="text-primary underline underline-offset-2" href="https://www.livechat.com/customer-service-report/" rel="noopener noreferrer" target="_blank">LiveChat</a>), porque las consultas por WhatsApp a una pyme suelen ser más cortas.</li>
<li class="">Chats resueltos por la IA: 65%, en línea con los dos tercios que reportó <a class="text-primary underline underline-offset-2" href="https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/" rel="noopener noreferrer" target="_blank">Klarna (2024)</a> y el 67% promedio que publicó Intercom para Fin (2025). El resultado real depende de tu negocio.</li>
<li class="">Velocidad de respuesta: <a class="text-primary underline underline-offset-2" href="https://hbr.org/2011/03/the-short-life-of-online-sales-leads" rel="noopener noreferrer" target="_blank">Harvard Business Review, "The Short Life of Online Sales Leads" (2011)</a>.</li>
<li class="">Costo: valor de referencia de una implementación típica de los planes Agente Esencial y Agente Avanzado (tu cotización final es personalizada), más la mensajería de WhatsApp según las <a class="text-primary underline underline-offset-2" href="https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing" rel="noopener noreferrer" target="_blank">tarifas de Meta</a>, suponiendo cuatro respuestas por chat.</li>
<li class="">No se suman ventas adicionales: no hay una fuente que permita estimarlas para tu negocio sin conocerlo.</li>
</ul>
</section>
<!-- SECTION 4: CASE STUDIES (COLOMBIAN ENTERPRISES) -->`,
)

// ---- Booking section ----
/*
 * The export carried its own lead panel: a different heading, a different
 * button and fields the contact endpoint does not take (a company name and an
 * economic sector instead of an email and a message). It is replaced by the
 * home's #contacto block, so a visitor meets the same booking section
 * whichever page they are on, and there is one form to keep working.
 */
{
  const { start, end } = enclosing(html, 'id="diagnostico"', 'section')
  html = html.slice(0, start) + bookingSection() + html.slice(end)
}

// "Validar en llamada", in the results card, pointed at the panel that is now
// the shared section.
// The section's hand-written rules travel with its markup.
swap('<style>', '<style>' + bookingStyles())

// ---- Liquid glass ----
/*
 * The comp's panels were a flat translucent fill (`bg-surface-glass` + blur)
 * while the home's cards use the liquid-glass recipe: gradient, rim light and
 * a hairline border. Every glass box here takes that same class. Only the
 * benefit cards keep its hover lift — on the calculator, the result card, the
 * FAQ rows and the pills a lift reads as a glitch, so they are pinned.
 */
swap(
  '<style>',
  '<style>.liquid-glass-static:hover{transform:none;border-color:rgba(255,255,255,0.12)!important;box-shadow:inset 0 1px 1px 0 rgba(255,255,255,0.15),0 20px 50px rgba(0,0,0,0.45)!important}\n',
)
swap(
  'bg-surface-glass backdrop-blur-xl rounded-2xl p-7 flex flex-col justify-between hover:bg-surface-elevated transition-all',
  'liquid-glass-surface rounded-2xl p-7 flex flex-col justify-between',
)
swap('bg-surface-glass backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]', 'liquid-glass-surface liquid-glass-static rounded-3xl p-6 sm:p-8')
swap('rounded-3xl bg-surface-glass backdrop-blur-2xl p-7', 'rounded-3xl liquid-glass-surface liquid-glass-static p-7')
swap('bg-surface-glass px-4 py-2 rounded-xl backdrop-blur-xl', 'liquid-glass-surface liquid-glass-static px-4 py-2 rounded-xl')
swap('bg-surface-glass backdrop-blur-xl', 'liquid-glass-surface liquid-glass-static')

swap('href="#diagnostico"', 'href="#contacto"')

/*
 * The simulator's own script ended with a mock submit handler bound to that
 * panel's form. With the panel gone `getElementById` returns null and the
 * handler throws — before the initial `calculate()` two lines below it, so the
 * whole calculator rendered as the comp's hard-coded sample figures and never
 * responded to a slider. The real handler ships with the shared section.
 */
swap(
  `      // Form submit mockup
      const leadForm = document.getElementById('lead-calculator-form');
      const formSuccess = document.getElementById('form-success-msg');
      leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        leadForm.classList.add('hidden');
        formSuccess.classList.remove('hidden');
      });

`,
  '',
)
// Same consent banner as the home — see public/cookie-consent.js.
swap('</body></html>', '<script src="/cookie-consent.js"></script>\n' + bookingScript + '</body></html>')

// ---- Brand lockup ----
/*
 * The export draws the mark as the letter "N" set in a rounded box, and
 * wordmarks it "Numi AI / COLOMBIA". The home page uses the real logo image
 * and reads "NUMI AI / SISTEMAS COGNITIVOS", at a heavier weight. Two pages
 * of one site must not disagree about what the logo is, so the header and the
 * footer here are rebuilt from the home's markup.
 *
 * The images come from build-stitch-home.mjs, which downloads them out of the
 * home export — this script does not fetch them a second time.
 */
for (const logo of ['logo-1.webp', 'logo-3.webp']) {
  if (!existsSync(new URL('../public/images/stitch/' + logo, import.meta.url))) {
    throw new Error('Missing ' + logo + ' — run `node scripts/build-stitch-home.mjs` first')
  }
}

const wordmark = (tagline) =>
  `<div class="flex flex-col">
<span class="font-headline-sm text-[20px] font-extrabold tracking-tight text-text-primary leading-none flex items-center gap-1.5">
NUMI <span class="bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent font-bold">AI</span>
</span>
<span class="text-[10px] tracking-[0.2em] uppercase font-semibold text-text-muted leading-tight">${tagline}</span>
</div>`

swap(
  '<div class="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"><span class="font-headline-sm text-headline-sm text-primary font-bold">N</span></div><div class="flex flex-col"><span class="font-headline-sm text-headline-sm tracking-tight text-on-surface leading-none">Numi <span class="text-primary font-bold">AI</span></span><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">Colombia</span></div>',
  `<a class="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(124,58,237,0.4)] border border-white/15 hover:scale-105 transition-transform duration-300" href="/__LOCALE__">
<img alt="Numi AI Logo" class="w-full h-full object-cover" src="/images/stitch/logo-1.webp">
</a>` + wordmark('Sistemas Cognitivos'),
)

swap(
  '<div class="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center"><span class="font-headline-sm text-headline-sm text-primary font-bold">N</span></div><span class="font-headline-sm text-headline-sm font-bold text-on-surface">Numi AI</span>',
  `<div class="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-md border border-white/15">
<img alt="Numi AI Logo" class="w-full h-full object-cover" src="/images/stitch/logo-3.webp">
</div>` + wordmark('Sistemas Cognitivos'),
)

// ---- Decorative avatar ----
/*
 * The comp's header ends in a round "Profile" photo. The site has no accounts
 * to be signed in to, so it depicts a user that cannot exist — and it is
 * served from a temporary Stitch URL that has already expired, so keeping it
 * would ship a broken image as well as a false affordance.
 */
html = html.replace(/<img alt="Profile"[^>]*>/g, '')

/*
 * Material Symbols are ligatures whose word ("calendar_month") is what a
 * screen reader reads out. Each icon here sits beside text that says the same
 * thing, so all of them are hidden from assistive tech — same as the home.
 */
{
  const before = html
  html = html.replace(/<span class="material-symbols-outlined/g, '<span aria-hidden="true" class="material-symbols-outlined')
  if (html === before) throw new Error('No Material Symbols found to hide')
}

// Skip link to the main landmark, as on the home: keyboard users otherwise tab
// through the whole header on every visit.
swap('<main class="w-full pt-20 bg-surface min-h-screen">', '<main class="w-full pt-20 bg-surface min-h-screen" id="contenido" tabindex="-1">')
swap(
  '<body class="bg-surface text-on-surface font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">',
  '<body class="bg-surface text-on-surface font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">\n<a class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-5 focus:py-3 focus:rounded-full focus:bg-primary-container focus:text-white focus:font-semibold" href="#contenido">Saltar al contenido</a>',
)

/*
 * Placeholders: the forms plugin paints them #6b7280, 4.1:1 on the field's
 * #0f061c — under the 4.5:1 WCAG AA minimum. The design's own muted tone
 * reads at 5.4:1. Same specificity as the plugin's rule, and this <style>
 * comes after the compiled Tailwind one, so it wins without !important.
 *
 * On touch screens, footer and contact links (16–20px tall) get 4px of block
 * padding to reach the 24px minimum target of WCAG 2.2 (2.5.8).
 */
swap(
  '<style>',
  '<style>input::placeholder,textarea::placeholder{color:#8d81a3;opacity:1}' +
    '@media (pointer:coarse){footer a,a[href^="mailto:"],a[href^="https://wa.me"],a[href="/es/calculadora-roi"],a[href="/en/calculadora-roi"]{display:inline-block;padding-block:4px}}\n',
)

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

/*
 * Surfaces are taken from the home page, not from this export.
 *
 * The two comps disagree: the home is built on the violet-black `#12081F`
 * family, this one on a neutral blue-graphite `#13131b`. That is the same
 * split `globals.css` records having already been settled once — the product
 * owner asked for the violet applied site-wide — and side by side the two
 * pages read as two different products. The accent, the type scale and the
 * fonts already match, so only the ground moves.
 *
 * The first block is copied verbatim from the home's config. The second
 * re-tints the tokens this export has and the home does not, holding each
 * one's lightness and moving it onto the same violet hue.
 */
const homeSurfaces = {
  background: '#12081F',
  surface: '#12081F',
  'surface-base': '#12081F',
  'surface-elevated': '#1a0f2c',
  'surface-container': '#201338',
  'surface-container-low': '#180c29',
  'surface-container-high': '#281745',
  'surface-container-lowest': '#0e051a',
  'text-muted': '#8d81a3',
}
const retinted = {
  'surface-dim': '#12081F',
  'surface-bright': '#352059',
  'surface-variant': '#2f1b52',
  'surface-container-highest': '#2f1b52',
  // The header sits on this. The home's bar is `bg-[#12081F]/80`, so this is
  // the same colour at the same opacity rather than a second glass recipe.
  'surface-glass': 'rgba(18, 8, 31, 0.8)',
  outline: '#9b8db6',
  'outline-variant': '#45385c',
  'inverse-on-surface': '#2b1c47',
}
twTheme.theme.extend.colors = { ...twTheme.theme.extend.colors, ...homeSurfaces, ...retinted }

// No trailing newline in this export, unlike the home one.
swap('<script src="https://cdn.tailwindcss.com"></script>', '')
swap(configMatch[0], '')

/*
 * The export also hard-codes some of those surfaces as arbitrary Tailwind
 * classes and inline styles, which the token override cannot reach. This runs
 * only after the config block is out of the document, so the swap above still
 * matches the text it was captured from.
 */
for (const [from, to] of [
  ['#13131b', '#12081F'],
  ['#0A0A12', '#12081F'],
  ['#0d0d16', '#0e051a'],
  ['#1b1b23', '#180c29'],
  ['#1f1f27', '#201338'],
  ['#292932', '#281745'],
  ['#121124', '#1a0f2c'],
  ['#34343d', '#2f1b52'],
  ['#393842', '#352059'],
]) {
  html = html.split(from).join(to).split(from.toLowerCase()).join(to)
}

// Preload the text fonts so they arrive sooner
swap(
  '<link href="https://fonts.googleapis.com/css2?family=Inter',
  '<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Plus+Jakarta+Sans:wght@600;700;800&amp;display=swap">\n<link href="https://fonts.googleapis.com/css2?family=Inter',
)

// Fonts from this site, not Google — see selfHostFonts in stitch-chrome.mjs.
html = await selfHostFonts(html)

// ---- English version ----
/*
 * The shared chrome's strings are translated by the home's dictionary, so the
 * nav and the booking section read the same on both pages instead of being
 * translated twice. Only this page's own keys are tracked for staleness.
 */
const sharedEn = JSON.parse(readFileSync(new URL('./stitch-en.json', import.meta.url), 'utf8'))
const ownEn = JSON.parse(readFileSync(new URL('./stitch-roi-en.json', import.meta.url), 'utf8'))
/*
 * The shared dictionary wins on a collision, so a string that appears in the
 * shared chrome reads the same on both pages. A collision that disagrees is
 * reported rather than silently resolved: it means the same Spanish sentence
 * is being translated twice, which is how the two pages drift apart.
 */
const clashes = Object.keys(ownEn).filter((k) => k in sharedEn && sharedEn[k] !== ownEn[k])
if (clashes.length) console.warn('Translated twice, shared wins:', clashes)
const en = { ...ownEn, ...sharedEn }
const missing = new Set(Object.keys(ownEn))
const tr = (t) => {
  const k = t.trim().replace(/\s+/g, ' ')
  if (k in en) { missing.delete(k); return t.replace(t.trim(), en[k]) }
  return t
}
// Translate text nodes and attributes outside <script>/<style>; inside scripts only quoted UI strings
let htmlEn = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/).map((chunk, i) => {
  if (i % 2 === 1) {
    return chunk.replace(/'([^'\n]+)'/g, (m, t) =>
      t in en ? (missing.delete(t), "'" + escapeSingleQuoted(en[t]) + "'") : m,
    )
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
