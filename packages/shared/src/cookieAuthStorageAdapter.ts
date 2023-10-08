import { GoTrueClientOptions, Session } from '@supabase/supabase-js';
import { DEFAULT_COOKIE_OPTIONS, parseSupabaseCookie, stringifySupabaseSession } from './utils';
import { CookieOptions, DefaultCookieOptions } from './types';

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

		if (!value) return null;

		// pkce code verifier
		if (key.endsWith('-code-verifier')) {
			return value;
		}

		return JSON.stringify(parseSupabaseCookie(value));
	}

	setItem(key: string, value: string): void | Promise<void> {
		// pkce code verifier
		if (key.endsWith('-code-verifier')) {
			this.setCookie(key, value);
			return;
		}

		let session: Session = JSON.parse(value);
		const sessionStr = stringifySupabaseSession(session);

		this.setCookie(key, sessionStr);
	}

	removeItem(key: string): void | Promise<void> {
		this.deleteCookie(key);
	}
}
