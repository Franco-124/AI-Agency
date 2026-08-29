import type { Lead } from '@/lib/schemas'
import { getSupabaseAdminClient } from '@/lib/supabase'

/**
 * Stand-in for the two optional form fields that the `leads` table declares
 * NOT NULL (`negocio`, `necesidad`). The form asks for both as optional, so a
 * visitor who skips them would otherwise send NULL and have the whole insert
 * rejected. Spanish to match the column names and the rest of the row.
 */
const NOT_PROVIDED = 'No aplica'

/**
 * Persists a validated lead.
 *
 * Column names are Spanish because they mirror the `leads` table as it was
 * created; the mapping is confined to this function so the rest of the code
 * keeps working with the English `Lead` shape.
 *
 * `interes` requires the matching column on the `leads` table in Supabase —
 * coordinate with whoever maintains `leads_prospeccion` sync before this
 * ships, per specs/asesoria-capacitacion-ia/spec.md §6.
 */
export async function saveLead(lead: Lead): Promise<void> {
  const { error } = await getSupabaseAdminClient().from('leads').insert({
    nombre: lead.name,
    negocio: lead.business ?? NOT_PROVIDED,
    dedicacion: lead.industry,
    interes: lead.interest,
    whatsapp: lead.whatsapp,
    correo: lead.email,
    necesidad: lead.message ?? NOT_PROVIDED,
    paquete_interes: lead.packageInterest ?? null,
  })

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`)
  }
}
