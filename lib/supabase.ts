import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Single shared client — safe for server components and client components alike
// for public (unauthenticated) reads. Auth flows will need a session-aware client later.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
