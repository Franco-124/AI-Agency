import type { Lead } from '@/lib/schemas'
import { getSupabaseAdminClient } from '@/lib/supabase'

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
    negocio: lead.business,
    dedicacion: lead.industry,
    interes: lead.interest,
    whatsapp: lead.whatsapp,
    correo: lead.email,
    necesidad: lead.message,
    paquete_interes: lead.packageInterest ?? null,
  })

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`)
  }
}
