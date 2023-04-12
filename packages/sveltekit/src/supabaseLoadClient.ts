import {
  CookieOptions,
  DEFAULT_COOKIE_OPTIONS,
  isBrowser,
  SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { LoadEvent } from '@sveltejs/kit';
import { SvelteKitLoadAuthStorageAdapter } from './loadStorageAdapter';

let cachedBrowserClient: SupabaseClient<any, string> | undefined;

/**
 * ## Authenticated Supabase client
 *
 * Returns a new authenticated Supabase client.
 *
 * When running in the browser it will create a single instance
 * that is returned for subsequent runs.
 *
 * ### Example:
 *
 * ```ts
 * import { invalidate } from '$app/navigation';
 * import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
 * import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
 * import type { LayoutLoad } from './$types';
 *
 * export const load: LayoutLoad = async ({ fetch, data, depends }) => {
 *   depends('supabase:auth');
 *
 *   const supabase = createSupabaseLoadClient({
 *     supabaseUrl: PUBLIC_SUPABASE_URL,
 *     supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
 *     event: { fetch },
 *     serverSession: data.session,
 *     onAuthStateChange() {
 *       invalidate('supabase:auth');
 *     }
 *   });
 *
 *   const {
 *     data: { session }
 * 	} = await supabase.auth.getSession();
 *
 *   return { supabase, session };
 * };
 *
 * ```
 */
export function createSupabaseLoadClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  supabaseUrl,
  supabaseKey,
  event,
  serverSession,
  options,
  cookieOptions
}: {
  supabaseUrl: string;
  /**
   * The supabase key. Make sure you **always** use the ANON_KEY.
   */
  supabaseKey: string;
  event: Pick<LoadEvent, 'fetch'>;
  /**
   * The initial session from the server.
   */
  serverSession: Session | null;
  options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
  cookieOptions?: CookieOptions;
}): SupabaseClient<Database, SchemaName> {
  const browser = isBrowser();
  if (browser && cachedBrowserClient) {
    return cachedBrowserClient as SupabaseClient<Database, SchemaName>;
  }

  const client = createClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
    ...options,
    global: {
      fetch: event.fetch,
      ...options?.global,
      headers: {
        ...options?.global?.headers,
        'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
      }
    },
    auth: {
      flowType: 'pkce',
      autoRefreshToken: browser,
      detectSessionInUrl: browser,
      persistSession: true,

      // fix this in supabase-js
      ...(cookieOptions?.name
        ? {
            storageKey: cookieOptions.name
          }
        : {}),

      storage: new SvelteKitLoadAuthStorageAdapter(serverSession, {
        ...DEFAULT_COOKIE_OPTIONS,
        ...cookieOptions
      })
    }
  });

  if (browser) {
    cachedBrowserClient = client;
  }

  return client;
}
