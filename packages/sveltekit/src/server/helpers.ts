import type { Session } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';
import { getServerConfig } from './config';

export function saveSession(
  cookies: Cookies,
  session: Session,
  response?: Response
) {
  const { cookieName, cookieOptions } = getServerConfig();

  const supabaseCookies = Object.entries({
    access: session.access_token,
    refresh: session.refresh_token,
    provider: session.provider_token
  });

  supabaseCookies.forEach(([type, value]) => {
    if (value) {
      const name = `${cookieName}-${type}-token`;
      if (response) {
        response.headers.append(
          'set-cookie',
          cookies.serialize(name, value, cookieOptions)
        );
      } else {
        cookies.set(name, value, cookieOptions);
      }
    }
  });
}

export function deleteSession(cookies: Cookies, response?: Response) {
  const { cookieName, cookieOptions } = getServerConfig();

  const opts = {
    ...cookieOptions,
    maxAge: -1
  };

  ['access', 'refresh', 'provider'].forEach((type) => {
    const name = `${cookieName}-${type}-token`;
    if (response) {
      response.headers.append('set-cookie', cookies.serialize(name, '', opts));
    } else {
      cookies.set(name, '', opts);
    }
  });
}

export function getProviderToken(cookies: Cookies) {
  const { cookieName } = getServerConfig();
  return cookies.get(`${cookieName}-provider-token`);
}
