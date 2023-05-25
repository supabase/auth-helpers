import {
	CookieAuthStorageAdapter,
	CookieOptions,
	CookieOptionsWithName,
	createSupabaseClient,
	parseCookies,
	serializeCookie,
	SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { NextResponse } from 'next/server';
import { splitCookiesString } from 'set-cookie-parser';

import type { NextRequest } from 'next/server';
import type { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

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

	private _setCookie(name: string, value: string, options?: CookieOptions) {
		const newSessionStr = serializeCookie(name, value, {
			...this.cookieOptions,
			...options,
			// Allow supabase-js on the client to read the cookie as well
			httpOnly: false
		});

		if (this.context.res.headers) {
			this.context.res.headers.append('set-cookie', newSessionStr);
			this.context.res.headers.append('cookie', newSessionStr);
		}
	}
}

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
			storageKey: cookieOptions?.name,
			storage: new NextMiddlewareAuthStorageAdapter(context, cookieOptions)
		}
	});
}
