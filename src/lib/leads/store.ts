import type { Lead } from '@/lib/schemas'
import { getSupabaseAdminClient } from '@/lib/supabase'

/**
 * Stand-in for `negocio`, the one column that is declared NOT NULL and no
 * longer has a form field behind it.
 *
 * The form was cut back to name, WhatsApp, email and a free-text message. This
 * placeholder keeps the row valid without a migration; the column stays in the
 * table because historical rows still hold real values.
 *
 * It is deliberately NOT written to `dedicacion` or `interes`. Both are
 * nullable, and `interes` additionally carries
 *
 *   CHECK (interes IS NULL OR interes = ANY (ARRAY[
 *     'automation', 'diagnostic', 'training', 'unsure'
 *   ]))
 *
 * so a free-text placeholder in that column is not merely unnecessary — it is
 * rejected outright, which took down the whole insert and returned 502 from
 * `/api/contact` for every submission. The column accepts NULL by design,
 * precisely so a lead that expressed no preference can say so.
 *
 * Spanish to match the column names and the rest of the row.
 */
const NOT_PROVIDED = 'No aplica'

/**
 * Persists a validated lead.
 *
 * Column names are Spanish because they mirror the `leads` table as it was
 * created; the mapping is confined to this function so the rest of the code
 * keeps working with the English `Lead` shape.
 *
 * `negocio` is written as a placeholder now that the form no longer collects
 * it — see `NOT_PROVIDED`. `dedicacion` and `interes` are written as NULL,
 * which is what "the visitor told us nothing" actually means and what both
 * columns are typed to accept. Anything downstream that segments on these
 * (the `leads_prospeccion` sync) must handle NULL rather than assume a value.
 */
export async function saveLead(lead: Lead): Promise<void> {
  const { error } = await getSupabaseAdminClient().from('leads').insert({
    nombre: lead.name,
    negocio: NOT_PROVIDED,
    dedicacion: null,
    /*
     * NULL, not a placeholder: this column is constrained to a fixed set of
     * slugs plus NULL, so any other string fails the CHECK and loses the lead.
     */
    interes: null,
    whatsapp: lead.whatsapp,
    correo: lead.email,
    necesidad: lead.message,
    /*
     * The packages section that set this is gone, so nothing can populate it
     * any more. The column stays in the table — historical rows still carry
     * real values and dropping it would lose them — and new rows write null.
     */
    paquete_interes: null,
  })

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`)
  }
}
