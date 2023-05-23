import {
	CookieAuthStorageAdapter,
	CookieOptions,
	CookieOptionsWithName,
	SupabaseClientOptionsWithoutAuth,
	createSupabaseClient
} from '@supabase/auth-helpers-shared';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

class NextServerComponentAuthStorageAdapter extends CookieAuthStorageAdapter {
	constructor(
		private readonly context: {
			cookies: () => ReadonlyRequestCookies;
		},
		cookieOptions?: CookieOptions
	) {
		super(cookieOptions);
	}

	protected getCookie(name: string): string | null | undefined {
		const nextCookies = this.context.cookies();
		return nextCookies.get(name)?.value;
	}
	protected setCookie(name: string, value: string): void {
		// Server Components cannot set cookies. Must use Middleware, Server Action or Route Handler
		// https://github.com/vercel/next.js/discussions/41745#discussioncomment-5198848
	}
	protected deleteCookie(name: string): void {
		// Server Components cannot set cookies. Must use Middleware, Server Action or Route Handler
		// https://github.com/vercel/next.js/discussions/41745#discussioncomment-5198848
	}
}

export function createServerComponentClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	context: {
		cookies: () => ReadonlyRequestCookies;
	},
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
			storage: new NextServerComponentAuthStorageAdapter(context, cookieOptions)
		}
	});
}
