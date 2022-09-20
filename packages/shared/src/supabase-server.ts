import { createClient, Session } from '@supabase/supabase-js';
import { parse, serialize } from 'cookie';
import { CookieOptions } from './types';
import { filterCookies, isSecureEnvironment } from './utils/cookies';
import { ensureArray } from './utils/helpers';

export function createServerSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  supabaseUrl,
  supabaseKey,
  getRequestHeader,
  getResponseHeader,
  setHeader,
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
  getRequestHeader: (key: string) => string | string[] | undefined;
  getResponseHeader: (key: string) => string | string[] | undefined;
  setHeader: (key: string, value: string | string[]) => void;
  cookieOptions?: CookieOptions;
}) {
  let currentSessionStr: string | null = null;

  const cookieStr = getRequestHeader('cookie');
  if (cookieStr) {
    ensureArray(cookieStr)
      .map((cookieStr) => parse(cookieStr))
      .forEach((cookie) => {
        if (cookie[name]) {
          currentSessionStr = cookie[name];
        }
      });
  }

  // preference the set-cookie header in case the session was already refreshed
  // for example in next middleware
  const setCookieStr = getRequestHeader('set-cookie');
  if (setCookieStr) {
    ensureArray(setCookieStr)
      .map((setCookieStr) => parse(setCookieStr))
      .forEach((cookie) => {
        if (cookie[name]) {
          currentSessionStr = cookie[name];
        }
      });
  }

  return createClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
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

          const newSetCookies = filterCookies(
            ensureArray(getResponseHeader('set-cookie') ?? []),
            key
          );

          const newSessionStr = serialize(key, value, {
            domain,
            path,
            maxAge,
            // Allow supabase-js on the client to read the cookie as well
            httpOnly: false,
            sameSite,
            secure: secure ?? isSecureEnvironment(getRequestHeader('host'))
          });

          setHeader('set-cookie', [...newSetCookies, newSessionStr]);
        },
        removeItem(key: string) {
          // don't remove the session if there isn't one
          if (!currentSessionStr) {
            return;
          }

          const newSetCookies = filterCookies(
            ensureArray(getResponseHeader('set-cookie') ?? []),
            key
          );

          const newSessionStr = serialize(key, '', {
            domain,
            path,
            expires: new Date(0),
            httpOnly: false,
            sameSite,
            secure: secure ?? isSecureEnvironment(getRequestHeader('host'))
          });

          setHeader('set-cookie', [...newSetCookies, newSessionStr]);
        }
      }
    }
  });
}
