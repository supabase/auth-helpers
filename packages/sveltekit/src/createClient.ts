import type { SupabaseClientOptions } from '@supabase/supabase-js';
import {
  createBrowserSupabaseClient,
  type CookieOptions,
  type SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { setConfig } from './config';
import { PKG_NAME, PKG_VERSION } from './constants';
import type { TypedSupabaseClient } from './types';
/** 
 * To get proper typings in the SupabaseClient:
 *  1. Use the CLI to generate the types: https://supabase.com/docs/guides/database/api/generating-types
 *  2. Add the types to your app.d.ts file as showin in this guide: https://supabase.com/docs/guides/auth/auth-helpers/sveltekit#typings
 */
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
    }
  };

  const globalInstance: TypedSupabaseClient = createBrowserSupabaseClient({
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
