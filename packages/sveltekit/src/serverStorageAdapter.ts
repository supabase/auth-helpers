import {
  CookieOptions,
  parseSupabaseCookie,
  stringifySupabaseSession
} from '@supabase/auth-helpers-shared';
import { RequestEvent } from '@sveltejs/kit';
import { GoTrueClientOptions, Session } from '@supabase/supabase-js';

export function supabaseAuthStorageAdapterSveltekitServer({
  cookies,
  cookieOptions: {
    name = 'sb-auth-token',
    domain,
    maxAge = 60 * 60 * 24 * 365,
    path = '/',
    sameSite,
    secure,
    httpOnly = false
  } = {},
  expiryMargin = 60
}: {
  cookies: RequestEvent['cookies'];
  cookieOptions?: CookieOptions & { httpOnly?: boolean };
  expiryMargin?: number;
}): GoTrueClientOptions['storage'] {
  let currentSession: Partial<Session> | null;
  let isInitialDelete = true;

  return {
    async getItem() {
      const sessionStr = cookies.get(name);
      const session = (currentSession = parseSupabaseCookie(sessionStr));
      if (session?.expires_at) {
        // shorten the session lifetime so it does not expire on the server
        session.expires_at -= expiryMargin;
      }
      return JSON.stringify(session);
    },
    async setItem(_key: string, value: string) {
      const session = JSON.parse(value);
      const sessionStr = stringifySupabaseSession(session);
      cookies.set(name, sessionStr, {
        domain,
        maxAge,
        path,
        sameSite,
        secure,
        httpOnly
      });
    },
    async removeItem() {
      // workaround until https://github.com/supabase/gotrue-js/pull/598
      if (isInitialDelete && currentSession?.expires_at) {
        const now = Math.round(Date.now() / 1000);
        if (currentSession.expires_at < now + 10) {
          isInitialDelete = false;
          return;
        }
      }
      cookies.delete(name, {
        domain,
        maxAge,
        path,
        sameSite,
        secure,
        httpOnly
      });
    }
  };
}
