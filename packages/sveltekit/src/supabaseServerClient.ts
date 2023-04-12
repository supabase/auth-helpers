import {
  CookieOptions,
  DEFAULT_COOKIE_OPTIONS,
  SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { createClient } from '@supabase/supabase-js';
import { RequestEvent } from '@sveltejs/kit';
import { SvelteKitServerAuthStorageAdapter } from './serverStorageAdapter';

/**
 * ## Authenticated Supabase client
 * ### Handle
 *
 * ```ts
 * import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
 * import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
 * import type { Handle } from '@sveltejs/kit';
 *
 * export const handle: Handle = async ({ event, resolve }) => {
 *   event.locals.supabase = createSupabaseServerClient({
 *     supabaseUrl: PUBLIC_SUPABASE_URL,
 *     supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
 *     event
 *   });
 *
 *   event.locals.getSession = async () => {
 *     const {
 *       data: { session }
 *     } = await event.locals.supabase.auth.getSession();
 *     return session;
 *   };
 *
 *   return resolve(event, {
 *     filterSerializedResponseHeaders(name) {
 *       return name === 'content-range';
 *     }
 *   });
 * };
 * ```
 *
 * ### Types
 *
 * ```ts
 * import { SupabaseClient, Session } from '@supabase/supabase-js';
 *
 * declare global {
 *   namespace App {
 *     interface Locals {
 *       supabase: SupabaseClient;
 *       getSession(): Promise<Session | null>;
 *     }
 *     // interface PageData {}
 *     // interface Error {}
 *     // interface Platform {}
 *   }
 * }
 *
 * export {};
 * ```
 */
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
      flowType: 'pkce',
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,

      // fix this in supabase-js
      ...(cookieOptions?.name
        ? {
            storageKey: cookieOptions.name
          }
        : {}),

      storage: new SvelteKitServerAuthStorageAdapter(
        event,
        {
          ...DEFAULT_COOKIE_OPTIONS,
          ...cookieOptions
        },
        expiryMargin
      )
    }
  });

  return client;
}
