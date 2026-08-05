import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Uses the public anon key. Safe to ship to the browser: the "messages"
// table's Row Level Security policy only allows this key to INSERT,
// never to SELECT, so guests cannot read other guests' messages.
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
