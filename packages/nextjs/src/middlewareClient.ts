import {
	CookieAuthStorageAdapter,
	CookieOptions,
	CookieOptionsWithName,
	createSupabaseClient,
	DefaultCookieOptions,
	parseCookies,
	serializeCookie,
	SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { NextResponse } from 'next/server';
import { splitCookiesString } from 'set-cookie-parser';

import type { NextRequest } from 'next/server';
import type { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * @deprecated Broken implementation, do not use.
 */
class NextMiddlewareAuthStorageAdapter extends CookieAuthStorageAdapter {
	constructor(
		private readonly context: { req: NextRequest; res: NextResponse },
		cookieOptions?: CookieOptions
	) {
		super(cookieOptions);
	}

	protected getCookie(name: string): string | null | undefined {
		const setCookie = splitCookiesString(
			this.context.res.headers.get('set-cookie')?.toString() ?? ''
		)
			.map((c) => parseCookies(c)[name])
			.find((c) => !!c);

		if (setCookie) {
			return setCookie;
		}

		const cookies = parseCookies(this.context.req.headers.get('cookie') ?? '');
		return cookies[name];
	}
	protected setCookie(name: string, value: string): void {
		this._setCookie(name, value);
	}
	protected deleteCookie(name: string): void {
		this._setCookie(name, '', {
			maxAge: 0
		});
	}

	private _setCookie(name: string, value: string, options?: DefaultCookieOptions) {
		const newSessionStr = serializeCookie(name, value, {
			...this.cookieOptions,
			...options,
			// Allow supabase-js on the client to read the cookie as well
			httpOnly: false
		});

		if (this.context.res.headers) {
			this.context.res.headers.append('set-cookie', newSessionStr);
		}
	}
}

/**
 * @deprecated Use {@link #createMiddlewareClientV2}. This function has a broken
 * implementation which can cause issues with maintaining the session for a
 * user for longer periods of time.
 */
export function createMiddlewareClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	context: { req: NextRequest; res: NextResponse },
	{
		supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
		supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		options,
		cookieOptions
	}: {
		supabaseUrl?: string;
		supabaseKey?: string;
		options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
		cookieOptions?: CookieOptionsWithName;
	} = {}
): SupabaseClient<Database, SchemaName, Schema> {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
		);
	}

	return createSupabaseClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, {
		...options,
		global: {
			...options?.global,
			headers: {
				...options?.global?.headers,
				'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
			}
		},
		auth: {
			storage: new NextMiddlewareAuthStorageAdapter(context, cookieOptions)
		}
	});
}

class RequestCookiesAuthStorageAdapter extends CookieAuthStorageAdapter {
	items: { [name: string]: string } = {};
	deleteItems: { [name: string]: boolean } = {};

	private res: NextResponse | null = null;

	constructor(private readonly req: NextRequest, cookieOptions?: CookieOptionsWithName) {
		super(cookieOptions);
	}

	async getItem(key: string): Promise<string | null> {
		if (this.items[key]) {
			return this.items[key];
		}

		const item = await super.getItem(key);

		if (item) {
			this.items[key] = item;
			delete this.deleteItems[key];
		}

		return item;
	}

	async setItem(key: string, value: string): Promise<void> {
		// note how this does not call super.setItem
		// this is intentional, as that implementation is used from commitCookies

		this.items[key] = value;
		delete this.deleteItems[key];
	}

	async removeItem(key: string): Promise<void> {
		// note how this does not call super.removeItem
		// this is intentional, as that implementation is used from commitCookies

		delete this.items[key];
		this.deleteItems[key] = true;
	}

	commitCookies(res: NextResponse) {
		try {
			this.res = res;

			const supRemoveItem = super.removeItem.bind(this);
			const supSetItem = super.setItem.bind(this);

			Object.keys(this.deleteItems).forEach((name) => {
				supRemoveItem(name);
			});

			Object.entries(this.items).forEach(([name, value]) => {
				supSetItem(name, value);
			});
		} finally {
			this.res = null;
		}
	}

	/**
	 * Only used initially from {@link #getItem}.
	 */
	protected getCookie(name: string): string | null | undefined {
		const cookies = parseCookies(this.req.headers.get('cookie') ?? '');
		return cookies[name];
	}

	/**
	 * Only called from {@link #commitCookies}.
	 */
	protected setCookie(name: string, value: string): void {
		return this._setCookie(name, value);
	}

	/**
	 * Only called from {@link #commitCookies}.
	 */
	protected deleteCookie(name: string): void {
		this._setCookie(name, '', {
			maxAge: 0
		});
	}

	private _setCookie(name: string, value: string, options?: DefaultCookieOptions): void {
		const newSessionStr = serializeCookie(name, value, {
			...this.cookieOptions,
			...options,
			// Allow supabase-js on the client to read the cookie as well
			httpOnly: false
		});

		if (this.res?.headers) {
			this.res.headers.append('set-cookie', newSessionStr);
		}
	}
}

/**
 * Returns an array of SupabaseClient and a function that when called produces
 * the {@link NextResponse#next()} response to be returned in the NextJS
 * middleware function.
 *
 * You must call this function towards the end of your middleware function,
 * typically as part of the return statement. Failing to return the result from
 * this function can result in your users being randomly logged out.
 *
 * @example Here's a basic example:
 * ```
 * export function middleware(request: NextRequest) {
 *   const [supabaseClient, nextResponse] = createMiddlewareClientV2(request, {})
 *
 *   const { data: { user } } = await supabaseClient.auth.getUser()
 *
 *   if (!user) {
 *     // there's no user session, ask them to log in
 *     return NextResponse.redirect(new URL('/sign-in-page-in-your-app'))
 *   }
 *
 *   return nextResponse()
 * }
 * ```
 */
export function createMiddlewareClientV2<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	req: NextRequest,
	{
		supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
		supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		options,
		cookieOptions
	}: {
		supabaseUrl?: string;
		supabaseKey?: string;
		options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
		cookieOptions?: CookieOptionsWithName;
	} = {}
) {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
		);
	}

	const storage = new RequestCookiesAuthStorageAdapter(req, cookieOptions);

	const client = createSupabaseClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, {
		...options,
		global: {
			...options?.global,
			headers: {
				...options?.global?.headers,
				'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
			}
		},
		auth: {
			storage
		}
	});

	const responseFn: () => NextResponse = () => {
		const requestCookies = (req.headers.get('cookie') || '')
			.split(/\s*;\s*/g)
			.map((part) => part.split(/=/g))
			.reduce((a, [name, value]) => {
				a[name] = value;
				return a;
			}, {} as { [cookie: string]: string });

		const removeKeys = {
			...storage.deleteItems,
			...storage.items
		};

		// remove the cookies and their chunks that the client decided
		// needed removing or setting
		Object.keys(removeKeys).forEach((key) => {
			delete requestCookies[key];

			const chunkNames = Object.keys(requestCookies).filter(
				(k) => k.startsWith(key) && k.length > key.length + 1 && k[key.length] === '.'
			);

			chunkNames.forEach((chunk) => {
				delete requestCookies[chunk];
			});
		});

		// after the cookies and their chunks have been cleaned up, we
		// can assign the set items directly; no chunking is needed as
		// these values will be passed down to the NextJS component /
		// page / route
		Object.keys(storage.items).forEach((key) => {
			requestCookies[key] = storage.items[key];
		});

		// reconstitute the cookie header on the request
		req.headers.set(
			'cookie',
			Object.entries(requestCookies)
				.map(([key, value]) => `${key}=${value}`)
				.join('; ')
		);

		const response = NextResponse.next({
			request: req
		});

		// finally commit the set values as Set-Cookie headers on the
		// actual response, so the browser can sync up state
		storage.commitCookies(response);

		return response;
	};

	return [client, responseFn];
}
