import { GoTrueClientOptions, Session } from '@supabase/supabase-js';
import { DEFAULT_COOKIE_OPTIONS, parseSupabaseCookie, stringifySupabaseSession } from './utils';
import { CookieOptions, DefaultCookieOptions } from './types';
import { combineChunks, createChunks } from './chunker';

export interface StorageAdapter extends Exclude<GoTrueClientOptions['storage'], undefined> {}

export abstract class CookieAuthStorageAdapter implements StorageAdapter {
	protected readonly cookieOptions: DefaultCookieOptions;

	constructor(cookieOptions?: CookieOptions) {
		this.cookieOptions = {
			...DEFAULT_COOKIE_OPTIONS,
			...cookieOptions,
			maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
		};
	}

	protected abstract getCookie(
		name: string
	): string | undefined | null | Promise<string | undefined | null>;
	protected abstract setCookie(name: string, value: string): void;
	protected abstract deleteCookie(name: string): void;

	async getItem(key: string): Promise<string | null> {
		const value = await this.getCookie(key);

		// pkce code verifier
		if (key.endsWith('-code-verifier') && value) {
			return value;
		}

		if (value) {
			return JSON.stringify(parseSupabaseCookie(value));
		}

		const chunks = combineChunks(key, (chunkName) => {
			return this.getCookie(chunkName);
		});

		return chunks !== null ? JSON.stringify(parseSupabaseCookie(chunks)) : null;
	}

	setItem(key: string, value: string): void | Promise<void> {
		// pkce code verifier
		if (key.endsWith('-code-verifier')) {
			this.setCookie(key, value);
			return;
		}

		let session: Session = JSON.parse(value);
		const sessionStr = stringifySupabaseSession(session);

		// split session string before setting cookie
		const sessionChunks = createChunks(key, sessionStr);

		sessionChunks.forEach((sess) => {
			this.setCookie(sess.name, sess.value);
		});
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

			if (value === undefined) {
				break;
			}
			this.deleteCookie(cookieName);
		}
	}
}
