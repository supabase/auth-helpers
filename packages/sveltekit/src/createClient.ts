import {
  createBrowserSupabaseClient,
  type CookieOptions,
  type SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { setConfig } from './config';
import { PKG_NAME, PKG_VERSION } from './constants';
import type { TypedSupabaseClient } from './types';

export function createClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptionsWithoutAuth<App.Supabase['SchemaName']>,
  cookieOptions?: CookieOptions
) {
  options = {
    ...options,
    global: {
      ...options?.global,
      headers: {
        ...options?.global?.headers,
        'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
      }
    }
  };
  cookieOptions = {
    name: 'supabase-auth-token',
    path: '/',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 365,
    ...cookieOptions
  };

  const globalInstance: TypedSupabaseClient = createBrowserSupabaseClient({
    supabaseUrl,
    supabaseKey,
    options,
    cookieOptions
  });

  setConfig({
    globalInstance,
    supabaseUrl,
    supabaseKey,
    options,
    cookieOptions
  });

  return globalInstance;
}
