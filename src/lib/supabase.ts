import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { requiredEnv } from '@/lib/env'

/**
 * Server-only Supabase client.
 *
 * It uses the secret (service role) key on purpose: the `leads` table denies
 * inserts to `anon` via RLS, so the write has to happen behind the API route.
 * This module must never be imported from a client component.
 */
let cachedClient: SupabaseClient | null = null

export function getSupabaseAdminClient(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(
      requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requiredEnv('SUPABASE_SECRET_KEY'),
      {
        // No browser session to keep alive — every call is a one-shot write.
        auth: { persistSession: false, autoRefreshToken: false },
      },
    )
  }

  return cachedClient
}
