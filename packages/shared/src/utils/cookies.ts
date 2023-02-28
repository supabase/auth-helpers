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

const decodeBase64URL = (value: string): string => {
  try {
    // atob is present in all browsers and nodejs >= 16
    // but if it is not it will throw a ReferenceError in which case we can try to use Buffer
    // replace are here to convert the Base64-URL into Base64 which is what atob supports
    // replace with //g regex acts like replaceAll
    // Decoding base64 to UTF8 see https://stackoverflow.com/a/30106551/17622044
    return decodeURIComponent(
      atob(value.replace(/[-]/g, '+').replace(/[_]/g, '/'))
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    if (e instanceof ReferenceError) {
      // running on nodejs < 16
      // Buffer supports Base64-URL transparently
      return Buffer.from(value, 'base64').toString('utf-8');
    } else {
      throw e;
    }
  }
};

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
        ...user
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
    session.provider_refresh_token
  ]);
}
