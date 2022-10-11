import { createClient, Session } from '@supabase/supabase-js';
import type { CookieSerializeOptions } from 'cookie';
import { CookieOptions, SupabaseClientOptions } from './types';
import { isSecureEnvironment } from './utils/cookies';

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
  options,
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
  let currentSessionStr: string | null = getCookie(name) ?? null;

  return createClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
    ...options,
    auth: {
      detectSessionInUrl: false,
      autoRefreshToken: false,
      storageKey: name,
      storage: {
        getItem(key: string) {
          return currentSessionStr;
        },
        setItem(key: string, _value: string) {
          // remove identities from the user as it sometimes can make the cookie too large
          let session: Session = JSON.parse(_value);
          delete session.user.identities;
          const value = JSON.stringify(session);

          // don't set the session if it's already set
          if (currentSessionStr === value) {
            return;
          }

          currentSessionStr = value;

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
          if (!currentSessionStr) {
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
