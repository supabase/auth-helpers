import { Session } from '@supabase/supabase-js';
import { parse, serialize } from 'cookie';

export { parse as parseCookies, serialize as serializeCookie };

/**
 * Filter out the cookies based on a key
 */
export function filterCookies(cookies: string[], key: string) {
  const indexes = new Set(
    cookies
      .map((cookie) => parse(cookie))
      .reduce((acc, cookie, i) => {
        if (key in cookie) {
          acc.push(i);
        }

        return acc;
      }, new Array<number>())
  );

  return cookies.filter((_, i) => !indexes.has(i));
}

/**
 * Based on the environment and the request we know if a secure cookie can be set.
 */
export function isSecureEnvironment(headerHost?: string | string[]) {
  if (!headerHost) {
    throw new Error('The "host" request header is not available');
  }

  const headerHostStr = Array.isArray(headerHost) ? headerHost[0] : headerHost;

  const host =
    (headerHostStr.indexOf(':') > -1 && headerHostStr.split(':')[0]) ||
    headerHostStr;
  if (
    ['localhost', '127.0.0.1'].indexOf(host) > -1 ||
    host.endsWith('.local')
  ) {
    return false;
  }

  return true;
}

export function parseSupabaseCookie(
  str: string | null | undefined
): Partial<Session> | null {
  if (!str) {
    return null;
  }

  try {
    const session = JSON.parse(str);
    if (!session) {
      return null;
    }

    const [_header, payloadStr, _signature] = session[0].split('.');
    const payload = base64urlToString(payloadStr);

    const { exp, sub, ...user } = JSON.parse(payload);

    return {
      expires_at: exp,
      expires_in: exp - Date.now() / 1000,
      token_type: 'bearer',
      access_token: session[0],
      refresh_token: session[1],
      provider_token: session[2],
      provider_refresh_token: session[3],
      user: {
        id: sub,
        ...user
      }
    };
  } catch (err) {
    return null;
  }
}

export function stringifySupabaseSession(session: Session): string {
  return JSON.stringify([
    session.access_token,
    session.refresh_token,
    session.provider_token,
    session.provider_refresh_token
  ]);
}

function base64urlToString(base64url: string) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64url, 'base64url').toString('utf-8');
  }
  return atob(base64url);
}
