import { createClient } from '@supabase/supabase-js';
export { SupabaseClient } from '@supabase/supabase-js';
import { PKG_NAME, PKG_VERSION } from '../constants';

const getClientWithEnvCheck = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables are required!'
    );
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      autoRefreshToken: false,
      persistSession: false,
      headers: {
        'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
      }
    }
  );
};

export const supabaseClient = getClientWithEnvCheck();
