import { createBrowserClient } from '@supabase/ssr'

// createBrowserClient stores session in cookies (not localStorage)
// so middleware on the server can read it — this is the key fix
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL     || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)
