import {
  CookieOptions,
  SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { createClient } from '@supabase/supabase-js';
import { RequestEvent } from '@sveltejs/kit';
import { supabaseAuthStorageAdapterSveltekitServer } from './serverStorageAdapter';

export function createSupabaseServerClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  supabaseUrl,
  supabaseKey,
  event,
  options,
  cookieOptions,
  expiryMargin
}: {
  supabaseUrl: string;
  supabaseKey: string;
  event: Pick<RequestEvent, 'cookies'>;
  options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
  cookieOptions?: CookieOptions;
  expiryMargin?: number;
}) {
  return createClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
    ...options,
    global: {
      ...options?.global,
      headers: {
        ...options?.global?.headers,
        'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
      }
    },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      storage: supabaseAuthStorageAdapterSveltekitServer({
        cookies: event.cookies,
        cookieOptions,
        expiryMargin
      })
    }
  });
}
