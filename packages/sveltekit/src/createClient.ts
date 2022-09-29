import type { SupabaseClientOptions } from '@supabase/supabase-js';
import {
  createBrowserSupabaseClient,
  type CookieOptions,
  type SupabaseClientOptions as SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { setConfig } from './config';
import { PKG_NAME, PKG_VERSION } from './constants';

export function createClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptionsWithoutAuth<App.Supabase['SchemaName']>,
  cookieOptions?: CookieOptions
) {
  const opts: SupabaseClientOptions<App.Supabase['SchemaName']> = {
    ...options,
    global: {
      ...options?.global,
      headers: {
        ...options?.global?.headers,
        'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
      }
    },
    auth: {
      storageKey: cookieOptions?.name ?? 'supabase-auth-token'
    }
  };

  const globalInstance = createBrowserSupabaseClient<App.Supabase['Database']>({
    supabaseUrl,
    supabaseKey,
    options: opts,
    cookieOptions
  });

  setConfig({
    globalInstance,
    supabaseUrl,
    supabaseKey,
    options: opts,
    cookieOptions: {
      name: 'supabase-auth-token',
      path: '/',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365,
      ...cookieOptions
    }
  });

  return globalInstance;
}
