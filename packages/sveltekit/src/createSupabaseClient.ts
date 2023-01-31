import {
  isBrowser,
  SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseAuthSveltekitStorageAdapter } from './storageAdapter';

let cachedBrowserClient: SupabaseClient;

export function createSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  supabaseUrl,
  supabaseKey,
  forceNew = false,
  options,
  path
}: {
  supabaseUrl: string;
  supabaseKey: string;
  forceNew?: boolean;
  options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
  path?: string;
}) {
  const browser = isBrowser();
  if (!forceNew && browser && cachedBrowserClient) {
    return cachedBrowserClient;
  }

  const client = createClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
    ...options,
    global: {
      ...options?.global,
      headers: {
        ...options?.global?.headers,
        'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
      }
    },
    auth: {
      autoRefreshToken: browser,
      detectSessionInUrl: browser,
      persistSession: true,
      storage: supabaseAuthSveltekitStorageAdapter({
        path,
        fetch: options?.global?.fetch
      })
    }
  });

  if (browser) {
    cachedBrowserClient = client as SupabaseClient;
  }

  return client;
}
