import { GoTrueClientOptions } from '@supabase/supabase-js';
import { CookieOptions } from './types';

export interface StorageAdapter
  extends Exclude<GoTrueClientOptions['storage'], undefined> {}

export abstract class CookieAuthStorageAdapter implements StorageAdapter {
  // No clue why, but 3600 matches 4kb in the browser
  static MAX_COOKIE_SIZE = 3600;

  protected abstract getCookie(name: string): string | undefined | null;
  protected abstract setCookie(name: string, value: string): void;
  protected abstract deleteCookie(name: string): void;

  getItem(key: string): string | Promise<string | null> | null {
    const value = this.getCookie(key);
    if (typeof value !== 'undefined') {
      return value;
    }

    const chunks: string[] = [];
    for (let i = 0; ; i++) {
      const cookieName = `${key}.${i}`;
      const chunk = this.getCookie(cookieName);

      if (chunk) {
        chunks.push(chunk);
      } else {
        break;
      }
    }
    return chunks.length ? chunks.join('') : null;
  }

  setItem(key: string, value: string): void | Promise<void> {
    this.removeItem(key);

    if (!value) return;

    const chunkCount = Math.ceil(
      value.length / CookieAuthStorageAdapter.MAX_COOKIE_SIZE
    );

    if (chunkCount === 1) {
      this._deleteChunkedCookies(key);
      this.setCookie(key, value);
      return;
    }

    this._deleteSingleCookie(key);
    this._deleteChunkedCookies(key, chunkCount);

    for (let i = 0; i < chunkCount; i++) {
      const chunk = value.substr(
        i * CookieAuthStorageAdapter.MAX_COOKIE_SIZE,
        CookieAuthStorageAdapter.MAX_COOKIE_SIZE
      );

      this.setCookie(`${key}.${i}`, chunk);
    }
  }

  removeItem(key: string): void | Promise<void> {
    this._deleteSingleCookie(key);
    this._deleteChunkedCookies(key);
  }

  private _deleteSingleCookie(key: string) {
    if (this.getCookie(key)) {
      this.deleteCookie(key);
    }
  }

  private _deleteChunkedCookies(key: string, from = 0) {
    for (let i = from; ; i++) {
      const cookieName = `${key}.${i}`;
      const value = this.getCookie(cookieName);

      if (value !== undefined) {
        this.deleteCookie(cookieName);
      } else {
        break;
      }
    }
  }
}
