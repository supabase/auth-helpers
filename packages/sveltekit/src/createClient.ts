import type { SupabaseClientOptions } from '@supabase/supabase-js';
import {
  createBrowserSupabaseClient,
  type CookieOptions,
  type SupabaseClientOptions as SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { setConfig } from './config';

export function createClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptionsWithoutAuth<App.Supabase['SchemaName']>,
  cookieOptions?: CookieOptions
) {
  const opts: SupabaseClientOptions<App.Supabase['SchemaName']> = {
    ...options,
    auth: {
      storageKey: cookieOptions?.name ?? 'supabase-auth-token'
    }
  };

  const globalInstance = createBrowserSupabaseClient<App.Supabase['Database']>({
    supabaseUrl,
    supabaseKey,
    options,
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
