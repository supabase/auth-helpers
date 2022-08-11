import { createClient } from '@supabase/supabase-js';
import { PKG_NAME, PKG_VERSION } from '../constants';

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
    persistSession: false,
    headers: {
      'X-Client-Info': `${PKG_NAME.replace('@', '').replace(
        '/',
        '-'
      )}/${PKG_VERSION}`
    }
  });
};

export { getClientWithEnvCheck };
