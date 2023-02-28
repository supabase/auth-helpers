import {
  CookieOptions,
  isBrowser,
  parseCookies,
  parseSupabaseCookie,
  serializeCookie,
  stringifySupabaseSession
} from '@supabase/auth-helpers-shared';
import { Session, GoTrueClientOptions } from '@supabase/supabase-js';

export function supabaseAuthStorageAdapterSveltekitLoad({
  serverSession,
  cookieOptions: {
    name = 'sb-auth-token',
    domain,
    maxAge = 60 * 60 * 24 * 365,
    path = '/',
    sameSite,
    secure
  } = {}
}: {
  serverSession?: Session | null;
  cookieOptions?: CookieOptions;
}): GoTrueClientOptions['storage'] {
  if (!isBrowser()) {
    return {
      async getItem() {
        return JSON.stringify(serverSession);
      },
      setItem() {},
      removeItem() {}
    };
  }

  return {
    async getItem() {
      const sessionStr = parseCookies(document.cookie)[name];
      const session = parseSupabaseCookie(sessionStr);
      return JSON.stringify(session);
    },
    async setItem(_key: string, value: string) {
      const session = JSON.parse(value);
      const sessionStr = stringifySupabaseSession(session);
      document.cookie = serializeCookie(name, sessionStr, {
        domain,
        maxAge,
        path,
        sameSite,
        secure,
        httpOnly: false
      });
    },
    async removeItem() {
      document.cookie = serializeCookie(name, '', {
        domain,
        maxAge: 0,
        path,
        sameSite,
        secure,
        httpOnly: false
      });
    }
  };
}
