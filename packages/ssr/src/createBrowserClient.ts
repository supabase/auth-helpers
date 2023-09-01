import { createClient } from '@supabase/supabase-js';
import { mergeDeepRight } from 'ramda';
import { DEFAULT_COOKIE_OPTIONS, isBrowser } from './utils';
import { parse, serialize } from 'cookie';

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	GenericSchema,
	SupabaseClientOptions
} from '@supabase/supabase-js/dist/module/lib/types';
import type { CookieOptionsWithName } from './types';

let cachedBrowserClient: SupabaseClient<any, string> | undefined;

export function createBrowserClient<
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
	options?: SupabaseClientOptions<SchemaName> & {
		cookieOptions?: CookieOptionsWithName;
		isSingleton?: boolean;
	}
) {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			`Your project's URL and Key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`
		);
	}

	let isSingleton = true;
	let cookieOptions: CookieOptionsWithName | undefined;
	let userDefinedClientOptions;

	if (options) {
		({ isSingleton = true, cookieOptions, ...userDefinedClientOptions } = options);
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
			storage: {
				getItem: (key: string) => {
					if (isBrowser()) {
						const cookies = parse(document.cookie);
						return cookies[key];
					}

					return null;
				},
				setItem: (key: string, value: string) => {
					if (isBrowser()) {
						document.cookie = serialize(key, value, {
							httpOnly: false,
							...DEFAULT_COOKIE_OPTIONS,
							...cookieOptions
						});
					}
				},
				removeItem: (key: string) => {
					if (isBrowser()) {
						document.cookie = serialize(key, '', {
							...DEFAULT_COOKIE_OPTIONS,
							maxAge: 0,
							httpOnly: false,
							...cookieOptions
						});
					}
				}
			}
		}
	};

	// Overwrites default client config with any user defined options
	const clientOptions = mergeDeepRight(
		cookieClientOptions,
		userDefinedClientOptions
	) as SupabaseClientOptions<SchemaName>;

	if (isSingleton) {
		// The `Singleton` pattern is the default to simplify the instantiation
		// of a Supabase client in the browser - there must only be one

		const browser = isBrowser();

		if (browser && cachedBrowserClient) {
			return cachedBrowserClient as SupabaseClient<Database, SchemaName, Schema>;
		}

		const client = createClient<Database, SchemaName, Schema>(
			supabaseUrl,
			supabaseKey,
			clientOptions
		);

		if (browser) {
			// The client should only be cached in the browser
			cachedBrowserClient = client;
		}

		return client;
	}

	// This allows for multiple Supabase clients, which may be required when using
	// multiple schemas. The user will be responsible for ensuring a single
	// instance of Supabase is used for each schema in the browser.
	return createClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, clientOptions);
}
