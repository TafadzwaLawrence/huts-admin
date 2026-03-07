import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Global singleton to survive hot reloading in development
const globalForSupabase = globalThis as unknown as {
  supabaseClient: SupabaseClient | undefined
}

export function createClient() {
  if (!globalForSupabase.supabaseClient) {
    globalForSupabase.supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return globalForSupabase.supabaseClient
}
