import type { Lead } from '@/lib/schemas'
import { getSupabaseAdminClient } from '@/lib/supabase'

/**
 * Persists a validated lead.
 *
 * Column names are Spanish because they mirror the `leads` table as it was
 * created; the mapping is confined to this function so the rest of the code
 * keeps working with the English `Lead` shape.
 */
export async function saveLead(lead: Lead): Promise<void> {
  const { error } = await getSupabaseAdminClient().from('leads').insert({
    nombre: lead.name,
    negocio: lead.business,
    dedicacion: lead.industry,
    whatsapp: lead.whatsapp,
    correo: lead.email,
    necesidad: lead.message,
    paquete_interes: lead.packageInterest ?? null,
  })

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`)
  }
}
