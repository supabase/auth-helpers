import { CookieAuthStorageAdapter, CookieOptions } from '@supabase/auth-helpers-shared';
import { Session } from '@supabase/supabase-js';
import { RequestEvent } from '@sveltejs/kit';

export class SvelteKitServerAuthStorageAdapter extends CookieAuthStorageAdapter {
	readonly isServer = true;

	private isInitialDelete = true;
	private currentSession: Partial<Session> | null = null;

	constructor(
		private readonly event: Pick<RequestEvent, 'cookies'>,
		cookieOptions?: CookieOptions,
		private readonly expiryMargin: number = 60
	) {
		super(cookieOptions);
	}

	protected getCookie(name: string) {
		return this.event.cookies.get(name);
	}

	protected setCookie(name: string, value: string) {
		this.event.cookies.set(name, value, {
			httpOnly: false,
			path: '/',
			...this.cookieOptions
		});
	}

	protected deleteCookie(name: string) {
		this.event.cookies.delete(name, {
			httpOnly: false,
			path: '/',
			...this.cookieOptions
		});
	}

	async getItem(key: string) {
		const sessionStr = await super.getItem(key);
		if (!sessionStr) {
			this.currentSession = null;
			return null;
		}

		const session: Session | null = JSON.parse(sessionStr);
		this.currentSession = session;

		if (session?.expires_at) {
			// shorten the session lifetime so it does not expire on the server
			session.expires_at -= this.expiryMargin;
		}
		return JSON.stringify(session);
	}

	removeItem(key: string) {
		if (this.isInitialDelete && this.currentSession?.expires_at) {
			const now = Math.round(Date.now() / 1000);
			if (this.currentSession.expires_at < now + 10) {
				this.isInitialDelete = false;
				return;
			}
		}
		super.removeItem(key);
	}
}
