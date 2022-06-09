import { createClient } from '@supabase/supabase-js';
export { SupabaseClient } from '@supabase/supabase-js';

const getClientWithEnvCheck = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_ANON_KEY env variables are required!'
    );
  }
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { autoRefreshToken: false, persistSession: false }
  );
};

export const supabaseClient = getClientWithEnvCheck();
