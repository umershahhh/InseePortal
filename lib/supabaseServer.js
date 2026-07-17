import { createClient } from '@supabase/supabase-js'

// This client uses the service role key — NEVER expose to browser
// Only used in API routes (server-side)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL  || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
