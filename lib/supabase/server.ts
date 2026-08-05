import { createClient } from '@supabase/supabase-js';

// Server-only client. Uses the service role key, which bypasses Row Level
// Security entirely, so it must NEVER be imported into a "use client"
// component or otherwise exposed to the browser bundle. Only call this
// from Server Components, Route Handlers, or Server Actions.
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
