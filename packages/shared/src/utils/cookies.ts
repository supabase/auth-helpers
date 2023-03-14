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

export function decodeBase64URL(value: string): string {
  const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let base64 = '';
  let chr1, chr2, chr3;
  let enc1, enc2, enc3, enc4;
  let i = 0;
  value = value.replace('-', '+').replace('_', '/');

  while (i < value.length) {
    enc1 = key.indexOf(value.charAt(i++));
    enc2 = key.indexOf(value.charAt(i++));
    enc3 = key.indexOf(value.charAt(i++));
    enc4 = key.indexOf(value.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    base64 = base64 + String.fromCharCode(chr1);

    if (enc3 != 64 && chr2 != 0) {
      base64 = base64 + String.fromCharCode(chr2);
    }
    if (enc4 != 64 && chr3 != 0) {
      base64 = base64 + String.fromCharCode(chr3);
    }
  }

  return base64;
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
    // Support previous cookie which was a stringified session object.
    if (session.constructor.name === 'Object') {
      return session;
    }
    if (session.constructor.name !== 'Array') {
      throw new Error(`Unexpected format: ${session.constructor.name}`);
    }

    const [_header, payloadStr, _signature] = session[0].split('.');
    const payload = decodeBase64URL(payloadStr);

    const { exp, sub, ...user } = JSON.parse(payload);

    return {
      expires_at: exp,
      expires_in: exp - Math.round(Date.now() / 1000),
      token_type: 'bearer',
      access_token: session[0],
      refresh_token: session[1],
      provider_token: session[2],
      provider_refresh_token: session[3],
      user: {
        id: sub,
        factors: session[4],
        ...user,
      }
    };
  } catch (err) {
    console.warn('Failed to parse cookie string:', err);
    return null;
  }
}

export function stringifySupabaseSession(session: Session): string {
  return JSON.stringify([
    session.access_token,
    session.refresh_token,
    session.provider_token,
    session.provider_refresh_token,
    session.user.factors,
  ]);
}
