import { createClient } from '@supabase/supabase-js'

// Cliente com service role — bypassa RLS, usar APENAS em server actions/route handlers
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
