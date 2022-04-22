import { createClient } from '@supabase/supabase-js';

const getClientWithEnvCheck = (
  supabaseUrl: string | undefined,
  supabaseAnonKey: string | undefined
) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'supabaseUrl and supabaseAnonKey env variables are required!'
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    autoRefreshToken: false,
    persistSession: false
  });
};

export { getClientWithEnvCheck };
