import { parse } from 'cookie';

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
