import { createClient, Session } from '@supabase/supabase-js';
import { parse, serialize } from 'cookie';
import { CookieOptions, SupabaseClientOptions } from './types';
import { parseSupabaseCookie, stringifySupabaseSession } from './utils/cookies';
import { isBrowser } from './utils/helpers';

export function createBrowserSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  supabaseUrl,
  supabaseKey,
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
  options?: SupabaseClientOptions<SchemaName>;
  cookieOptions?: CookieOptions;
}) {
  return createClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
    ...options,
    auth: {
      storageKey: name,
      storage: {
        getItem(key: string) {
          if (!isBrowser()) {
            return null;
          }

          const cookies = parse(document.cookie);
          const session = parseSupabaseCookie(cookies[key]);

          return session ? JSON.stringify(session) : null;
        },
        setItem(key: string, _value: string) {
          if (!isBrowser()) {
            return;
          }

          let session: Session = JSON.parse(_value);
          const value = stringifySupabaseSession(session);

          document.cookie = serialize(key, value, {
            domain,
            path,
            maxAge,
            // Allow supabase-js on the client to read the cookie as well
            httpOnly: false,
            sameSite,
            secure: secure ?? document.location?.protocol === 'https:'
          });
        },
        removeItem(key: string) {
          if (!isBrowser()) {
            return;
          }

          document.cookie = serialize(key, '', {
            domain,
            path,
            expires: new Date(0),
            httpOnly: false,
            sameSite,
            secure: secure ?? document.location?.protocol === 'https:'
          });
        }
      }
    }
  });
}
