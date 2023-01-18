import {
  CookieOptions,
  SupabaseClientOptionsWithoutAuth,
  parseSupabaseCookie,
  stringifySupabaseSession,
  isBrowser,
  parseCookies,
  serializeCookie
} from '@supabase/auth-helpers-shared';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { RequestEvent } from '@sveltejs/kit';

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
  cookieOptions
}: {
  supabaseUrl: string;
  supabaseKey: string;
  event: Pick<RequestEvent, 'cookies'>;
  options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
  cookieOptions?: CookieOptions;
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
      storage: createSupabaseAuthServerStorage({
        event,
        cookieOptions
      })
    }
  });
}

let cachedBrowserClient: SupabaseClient;

export function createSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  supabaseUrl,
  supabaseKey,
  initialSession,
  forceNew = false,
  options,
  cookieOptions
}: {
  supabaseUrl: string;
  supabaseKey: string;
  initialSession: Session | null;
  forceNew?: boolean;
  options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
  cookieOptions?: CookieOptions;
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
      storage: createSupabaseAuthClientStorage({
        initialSession,
        cookieOptions
      })
    }
  });

  if (browser) {
    cachedBrowserClient = client as SupabaseClient;
  }

  return client;
}

function createSupabaseAuthServerStorage({
  event: { cookies },
  cookieOptions
}: {
  event: Pick<RequestEvent, 'cookies'>;
  cookieOptions?: CookieOptions;
}) {
  const cookieName = cookieOptions?.name ?? 'sb-auth-token';
  let currentSession = parseSupabaseCookie(cookies.get(cookieName));

  /**
   * this shouldn´t be necessary,
   * but gotrue currently does not refresh the session
   * when it expires within the next 10 seconds (EXPIRY_MARGIN)
   * when autoRefreshToken is set to false
   *
   * autoRefreshToken must be set to false because we don´t want
   * gotrue to set a refresh timer on the server
   */
  const timeNow = Math.round(Date.now() / 1000);
  const expiry_margin = 60;
  if (
    currentSession?.expires_at &&
    currentSession.expires_at < timeNow + expiry_margin
  ) {
    currentSession.expires_at = currentSession.expires_at - expiry_margin;
  }

  return {
    getItem() {
      return JSON.stringify(currentSession);
    },
    setItem(_key: string, value: string) {
      const session: Session = JSON.parse(value);
      const sessionStr = stringifySupabaseSession(session);
      currentSession = session;

      cookies.set(cookieName, sessionStr, {
        httpOnly: false,
        ...cookieOptions
      });
    },
    removeItem() {
      if (!currentSession) return;

      cookies.delete(cookieName, {
        httpOnly: false,
        ...cookieOptions
      });
    }
  };
}

function createSupabaseAuthClientStorage({
  initialSession,
  cookieOptions
}: {
  initialSession: Session | null;
  cookieOptions?: CookieOptions;
}) {
  const cookieName = cookieOptions?.name ?? 'sb-auth-token';
  const browser = isBrowser();

  return {
    getItem() {
      if (!browser) {
        return JSON.stringify(initialSession);
      }
      const cookies = parseCookies(document.cookie);
      const session = parseSupabaseCookie(cookies[cookieName]);
      return session ? JSON.stringify(session) : null;
    },
    setItem(_key: string, value: string) {
      if (!browser) {
        return;
      }
      const sessionStr = stringifySupabaseSession(JSON.parse(value));
      document.cookie = serializeCookie(cookieName, sessionStr, {
        ...cookieOptions,
        httpOnly: false
      });
    },
    removeItem() {
      if (!browser) {
        return;
      }
      document.cookie = serializeCookie(cookieName, '', {
        ...cookieOptions,
        httpOnly: false,
        expires: new Date(0),
        maxAge: 0
      });
    }
  };
}
