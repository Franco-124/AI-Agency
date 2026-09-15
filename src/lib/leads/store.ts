import type { Lead } from '@/lib/schemas'
import { getSupabaseAdminClient } from '@/lib/supabase'

/**
 * Stand-in for the `leads` columns that are declared NOT NULL but no longer
 * have a form field behind them.
 *
 * The form was cut back to name, WhatsApp, email and a free-text message, so
 * `negocio`, `dedicacion` and `interes` have nothing to carry — and sending
 * NULL for any of them would have the whole insert rejected and lose the lead.
 * Writing this placeholder keeps the row valid without a migration; the
 * columns stay in the table because historical rows still hold real values.
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
 * `negocio`, `dedicacion` and `interes` are written as placeholders now that
 * the form no longer collects them — see `NOT_PROVIDED`. Anything downstream
 * that segments on those columns (the `leads_prospeccion` sync) will see the
 * placeholder rather than a vertical, so coordinate before relying on them.
 */
export async function saveLead(lead: Lead): Promise<void> {
  const { error } = await getSupabaseAdminClient().from('leads').insert({
    nombre: lead.name,
    negocio: NOT_PROVIDED,
    dedicacion: NOT_PROVIDED,
    interes: NOT_PROVIDED,
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
