import { createClient, Session } from '@supabase/supabase-js';
import { parse, serialize } from 'cookie';
import { CookieOptions } from './types';
import { isBrowser } from './utils/helpers';

export function createBrowserSupabaseClient({
  supabaseUrl,
  supabaseKey,
  cookieOptions: {
    name = 'supabase-auth-token',
    domain,
    path = '/',
    sameSite = 'lax',
    secure = false
  } = {}
}: {
  supabaseUrl: string;
  supabaseKey: string;
  cookieOptions?: CookieOptions;
}) {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      storageKey: name,
      storage: {
        getItem(key: string) {
          if (!isBrowser()) {
            return null;
          }

          const cookies = parse(document.cookie);
          return cookies[key] || null;
        },
        setItem(key: string, _value: string) {
          if (!isBrowser()) {
            return;
          }

          // remove identities from the user as it sometimes can make the cookie too large
          // TODO: note this in docs
          let session: Session = JSON.parse(_value);
          delete session.user.identities;
          const value = JSON.stringify(session);

          document.cookie = serialize(key, value, {
            domain,
            path,
            maxAge: 1000 * 60 * 60 * 24 * 365,
            // Allow supabase-js on the client to read the cookie as well
            httpOnly: false,
            sameSite,
            // TODO: set this secure based on the browser location
            secure
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
            secure
          });
        }
      }
    }
  });
}
