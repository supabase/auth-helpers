import { createClient } from '@supabase/supabase-js';
import { AuthHelperSupabaseClientOptions } from './types';
import { isBrowser } from './utils';

export function createSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>(
  supabaseUrl: string,
  supabaseKey: string,
  options: AuthHelperSupabaseClientOptions<SchemaName>
) {
  const bowser = isBrowser();

  return createClient(supabaseUrl, supabaseKey, {
    ...options,
    auth: {
      flowType: 'pkce',
      autoRefreshToken: bowser,
      detectSessionInUrl: bowser,
      persistSession: true,
      storage: options.auth.storage,

      // fix this in supabase-js
      ...(options.auth?.storageKey
        ? {
            storageKey: options.auth.storageKey
          }
        : {})
    }
  });
}
