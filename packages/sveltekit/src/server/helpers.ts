import type { Session } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';
import { getServerConfig } from './config';

function getCookieOptions(): {
  cookieName: string;
  cookieOptions: Parameters<import('@sveltejs/kit').Cookies['serialize']>[2];
} {
  const { cookieOptions } = getServerConfig();
  return {
    cookieName: cookieOptions.name,
    cookieOptions: {
      domain: cookieOptions.domain,
      maxAge: cookieOptions.lifetime,
      httpOnly: true,
      path: cookieOptions.path,
      sameSite: cookieOptions.sameSite as any,
      secure: cookieOptions.secure
    }
  };
}

/**
 * Save the session using cookies
 * @param cookies sveltekit´s Cookie API
 * @param session Supabase Session
 * @param response an optional `Response` to append the cookie header to
 */
export function saveSession(
  cookies: Cookies,
  session: Session,
  response?: Response
) {
  const { cookieName, cookieOptions } = getCookieOptions();

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
          cookies.serialize(name, value, {})
        );
      } else {
        cookies.set(name, value, cookieOptions);
      }
    }
  });
}

/**
 * Clear the session cookies
 * @param cookies sveltekit´s Cookie API
 * @param response an optional `Response` to append the cookie header to
 */
export function deleteSession(cookies: Cookies, response?: Response) {
  const { cookieName, cookieOptions } = getCookieOptions();

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
  const { cookieOptions } = getServerConfig();
  return cookies.get(`${cookieOptions.name}-provider-token`);
}
