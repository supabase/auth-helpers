import { parse, serialize } from 'cookie';
import { CookieAuthStorageAdapter } from './cookieAuthStorageAdapter';
import { CookieOptions } from './types';
import { isBrowser } from './utils';

export class BrowserCookieAuthStorageAdapter extends CookieAuthStorageAdapter {
  constructor(cookieOptions?: CookieOptions) {
    super(cookieOptions);
  }

  protected getCookie(name: string) {
    if (!isBrowser()) return null;

    const cookies = parse(document.cookie);
    return cookies[name];
  }

  protected setCookie(name: string, value: string) {
    if (!isBrowser()) return null;

    document.cookie = serialize(name, value, {
      ...this.cookieOptions,
      httpOnly: false
    });
  }

  protected deleteCookie(name: string) {
    if (!isBrowser()) return null;

    document.cookie = serialize(name, '', {
      ...this.cookieOptions,
      maxAge: 0,
      httpOnly: false
    });
  }
}
