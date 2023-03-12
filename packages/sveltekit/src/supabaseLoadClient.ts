import {
  CookieOptions,
  isBrowser,
  SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import {
  AuthChangeEvent,
  createClient,
  Session,
  Subscription,
  SupabaseClient
} from '@supabase/supabase-js';
import { LoadEvent } from '@sveltejs/kit';
import { supabaseAuthStorageAdapterSveltekitLoad } from './loadStorageAdapter';

let cachedBrowserClient: SupabaseClient<any, string> | undefined;
let onAuthStateChangeSubscription: Subscription | undefined;

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
  cookieOptions,
  onAuthStateChange
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
  /**
   * The event listener only runs in the browser.
   * @deprecated DO NOT USE THIS
   *
   * use this instead: https://supabase.com/docs/guides/auth/auth-helpers/sveltekit#setting-up-the-event-listener-on-the-client-side
   */
  onAuthStateChange?: (event: AuthChangeEvent, session: Session | null) => void;
}): SupabaseClient<Database, SchemaName> {
  const browser = isBrowser();
  if (browser && cachedBrowserClient) {
    return cachedBrowserClient as SupabaseClient<Database, SchemaName>;
  }

  // this should never happen
  onAuthStateChangeSubscription?.unsubscribe();

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
      autoRefreshToken: browser,
      detectSessionInUrl: browser,
      persistSession: true,
      storage: supabaseAuthStorageAdapterSveltekitLoad({
        cookieOptions,
        serverSession
      })
    }
  });

  if (browser) {
    cachedBrowserClient = client;
    onAuthStateChangeSubscription = onAuthStateChange
      ? cachedBrowserClient.auth.onAuthStateChange((event, authSession) => {
          onAuthStateChange?.(event, authSession);
        }).data.subscription
      : undefined;
  }

  return client;
}
