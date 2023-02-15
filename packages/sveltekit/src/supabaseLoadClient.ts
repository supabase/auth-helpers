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

let cachedBrowserClient: SupabaseClient | undefined;
let onAuthStateChangeSubscription: Subscription | undefined;

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
  supabaseKey: string;
  event: Pick<LoadEvent, 'fetch'>;
  serverSession: Session | null;
  options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
  cookieOptions?: CookieOptions;
  onAuthStateChange?: (event: AuthChangeEvent, session: Session | null) => void;
}) {
  const browser = isBrowser();
  if (browser && cachedBrowserClient) {
    return cachedBrowserClient;
  }

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
    cachedBrowserClient = client as SupabaseClient;
    onAuthStateChangeSubscription = onAuthStateChange
      ? cachedBrowserClient.auth.onAuthStateChange((event, authSession) => {
          onAuthStateChange?.(event, authSession);
        }).data.subscription
      : undefined;
  }

  return client;
}
