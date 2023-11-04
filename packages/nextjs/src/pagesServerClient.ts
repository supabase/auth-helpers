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
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { splitCookiesString } from 'set-cookie-parser';

import type { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

class NextServerAuthStorageAdapter extends CookieAuthStorageAdapter {
	constructor(
		private readonly context:
			| GetServerSidePropsContext
			| { req: NextApiRequest; res: NextApiResponse },
		cookieOptions?: CookieOptions
	) {
		super(cookieOptions);
	}

	protected getCookie(name: string): string | null | undefined {
		const setCookie = splitCookiesString(
			this.context.res?.getHeader('set-cookie')?.toString() ?? ''
		)
			.map((c) => parseCookies(c)[name])
			.find((c) => !!c);

		const value = setCookie ?? this.context.req?.cookies[name];
		return value;
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
		const setCookies = splitCookiesString(
			this.context.res.getHeader('set-cookie')?.toString() ?? ''
		).filter((c) => !(name in parseCookies(c)));

		const cookieStr = serializeCookie(name, value, {
			...this.cookieOptions,
			...options,
			// Allow supabase-js on the client to read the cookie as well
			httpOnly: false
		});

		this.context.res.setHeader('set-cookie', [...setCookies, cookieStr]);
	}
}

export function createPagesServerClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	context: GetServerSidePropsContext | { req: NextApiRequest; res: NextApiResponse },
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
			storage: new NextServerAuthStorageAdapter(context, cookieOptions)
		}
	});
}
