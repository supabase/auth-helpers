import { createClient, Session, SupabaseClientOptions } from '@supabase/supabase-js';
import type { CookieSerializeOptions } from 'cookie';
import { CookieOptions } from './types';
import {
  isSecureEnvironment,
  parseSupabaseCookie,
  stringifySupabaseSession
} from './utils/cookies';

export function createServerSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  supabaseUrl,
  supabaseKey,
  getCookie,
  setCookie,
  getRequestHeader,
  options: {auth, ...options} = {},
  cookieOptions: {
    name = 'supabase-auth-token',
    domain,
    path = '/',
    sameSite = 'lax',
    secure,
    maxAge = 1000 * 60 * 60 * 24 * 365
  } = {}
}: {
  supabaseUrl: string;
  supabaseKey: string;
  getCookie: (name: string) => string | undefined;
  setCookie: (
    name: string,
    value: string,
    options: CookieSerializeOptions
  ) => void;
  getRequestHeader: (name: string) => string | string[] | undefined;
  options?: SupabaseClientOptions<SchemaName>;
  cookieOptions?: CookieOptions;
}) {
  let currentSession = parseSupabaseCookie(getCookie(name)) ?? null;

  return createClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
    ...options,
    auth: {
      ...auth,
      detectSessionInUrl: false,
      autoRefreshToken: false,
      storageKey: name,
      storage: {
        getItem(key: string) {
          return JSON.stringify(currentSession);
        },
        setItem(key: string, _value: string) {
          let session: Session = JSON.parse(_value);
          const value = stringifySupabaseSession(session);

          currentSession = session;

          setCookie(key, value, {
            domain,
            path,
            maxAge,
            // Allow supabase-js on the client to read the cookie as well
            httpOnly: false,
            sameSite,
            secure: secure ?? isSecureEnvironment(getRequestHeader('host'))
          });
        },
        removeItem(key: string) {
          // don't remove the session if there isn't one
          if (!currentSession) {
            return;
          }

          setCookie(key, '', {
            domain,
            path,
            expires: new Date(0),
            httpOnly: false,
            sameSite,
            secure: secure ?? isSecureEnvironment(getRequestHeader('host'))
          });
        }
      }
    }
  });
}
