import { createClient } from '@supabase/supabase-js';
import { CookieAuthStorageAdapter } from '@supabase/auth-helpers-shared';
import { mergeDeepRight } from 'ramda';
import { isBrowser } from './utils';
import type { CookieOptionsWithName, ServerCookieMethods } from './types';

import type {
	GenericSchema,
	SupabaseClientOptions
} from '@supabase/supabase-js/dist/module/lib/types';

class ServerCookieAuthStorageAdapter extends CookieAuthStorageAdapter {
	constructor(
		private readonly context: {
			cookies: ServerCookieMethods;
		},
		cookieOptions?: CookieOptionsWithName
	) {
		super(cookieOptions);
	}

	protected getCookie(
		name: string
	): string | undefined | null | Promise<string | undefined | null> {
		return this.context.cookies.get(name) ?? null;
	}
	protected setCookie(name: string, value: string): void {
		this.context.cookies.set(name, value, this.cookieOptions);
	}
	protected deleteCookie(name: string): void {
		this.context.cookies.remove(name, this.cookieOptions);
	}
}

export function createServerClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	supabaseUrl: string,
	supabaseKey: string,
	options: SupabaseClientOptions<SchemaName> & {
		cookies: ServerCookieMethods;
		cookieOptions?: CookieOptionsWithName;
	}
) {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			`Your project's URL and Key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`
		);
	}

	const { cookies, cookieOptions, ...userDefinedClientOptions } = options;

	if (!cookies.get || !cookies.set || !cookies.remove) {
		// todo: point to helpful docs in error message, once they have been written! 😏
		throw new Error(
			'The Supabase client requires functions to get, set, and remove cookies in your specific framework!'
		);
	}

	const cookieClientOptions = {
		global: {
			headers: {
				'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
			}
		},
		auth: {
			flowType: 'pkce',
			autoRefreshToken: isBrowser(),
			detectSessionInUrl: isBrowser(),
			persistSession: true,
			storage: new ServerCookieAuthStorageAdapter({ cookies: cookies }, cookieOptions)
		}
	};

	// Overwrites default client config with any user defined options
	const clientOptions = mergeDeepRight(
		cookieClientOptions,
		userDefinedClientOptions
	) as SupabaseClientOptions<SchemaName>;

	return createClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, clientOptions);
}
