import { parse, serialize } from 'cookie';
import { CookieAuthStorageAdapter } from './cookieAuthStorageAdapter';
import { CookieOptions } from './types';
import { DEFAULT_COOKIE_OPTIONS, isBrowser } from './utils';

export class BrowserCookieAuthStorageAdapter extends CookieAuthStorageAdapter {
  constructor(private readonly cookieOptions?: CookieOptions) {
    super();
  }

  protected getCookie(name: string) {
    if (!isBrowser()) return null;

    const cookies = parse(document.cookie);
    return cookies[name];
  }

  protected setCookie(name: string, value: string) {
    if (!isBrowser()) return null;

    document.cookie = serialize(name, value, {
      ...DEFAULT_COOKIE_OPTIONS,
      ...this.cookieOptions,
      httpOnly: false
    });
  }

  protected deleteCookie(name: string) {
    if (!isBrowser()) return null;

    document.cookie = serialize(name, '', {
      ...DEFAULT_COOKIE_OPTIONS,
      ...this.cookieOptions,
      maxAge: 0,
      httpOnly: false
    });
  }
}
