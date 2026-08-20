/**
 * Single source of truth for the savings calculator's constants. Update the
 * numbers here — never inline them in the component or the calculation
 * logic — so a future recalibration with real client data touches only this
 * file.
 *
 * These are generic, conservative benchmarks for the SMB AI-automation
 * sector. They are deliberately NOT derived from Numi AI's own Casas y
 * Espacios case study (+40% service capacity) — that is a single documented
 * result, not a representative average, and using it here would overstate
 * what a typical visitor should expect.
 */

/**
 * Average working hours per month, used to derive an hourly rate from a
 * monthly salary. Based on a standard Colombian labor month (8h x ~24
 * business days). Generic benchmark, not client-specific data.
 * Last reviewed: 2026-08-20.
 */
export const HORAS_LABORALES_MES = 192

/**
 * Conservative share of time spent on repetitive tasks (WhatsApp replies,
 * scheduling, lead follow-up) that gets freed up after automation. Public
 * case studies in the SMB AI-automation space report reductions roughly in
 * a 50%-70% range; the low end is used as the default so the estimate never
 * overstates savings.
 *
 * TODO(validación humana): reemplazar por un valor calculado a partir de un
 * promedio real cuando existan 2-3 casos de clientes de Numi AI adicionales
 * con datos de horas/salario documentados. Hasta entonces, mantener este
 * valor conservador del sector.
 * Last reviewed: 2026-08-20.
 */
export const PORCENTAJE_REDUCCION_CONSERVADOR = 0.5

/**
 * Implementation (one-time) price of Package 2 — Automatización + Atención
 * Full — used as the payback reference. Monthly maintenance is deliberately
 * excluded from this figure.
 *
 * Fuente: precio publicado en la sección de paquetes ("Desde COP
 * $3.000.000"). Precio marcado como PENDIENTE DE VALIDACIÓN en la
 * Definición Estratégica — actualizar aquí si cambia en la landing
 * (`messages/es.json` / `messages/en.json`, `packages.two.price`). No hay
 * todavía una fuente de precios centralizada en el repo — ese texto es solo
 * copy de i18n, no un dato numérico reutilizable.
 * Last reviewed: 2026-08-20.
 */
export const PRECIO_IMPLEMENTACION_PAQUETE_2 = 3_000_000
