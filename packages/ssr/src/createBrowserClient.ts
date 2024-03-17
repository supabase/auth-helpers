import { createClient } from '@supabase/supabase-js';
import { mergeDeepRight } from 'ramda';
import {
	DEFAULT_COOKIE_OPTIONS,
	combineChunks,
	createChunks,
	deleteChunks,
	isBrowser
} from './utils';
import { parse, serialize } from 'cookie';

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	GenericSchema,
	SupabaseClientOptions
} from '@supabase/supabase-js/dist/module/lib/types';
import type { CookieMethods, CookieOptionsWithName } from './types';

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
		cookies: CookieMethods;
		cookieOptions?: CookieOptionsWithName;
		isSingleton?: boolean;
	}
) {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			`Your project's URL and Key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`
		);
	}

	let cookies: CookieMethods = {};
	let isSingleton = true;
	let cookieOptions: CookieOptionsWithName | undefined;
	let userDefinedClientOptions;

	if (options) {
		({ cookies, isSingleton = true, cookieOptions, ...userDefinedClientOptions } = options);
		cookies = cookies || {}; 
	}

	const cookieClientOptions = {
		global: {
			headers: {
				'X-Client-Info': `${PACKAGE_NAME}/${PACKAGE_VERSION}`
			}
		},
		auth: {
			flowType: 'pkce',
			autoRefreshToken: isBrowser(),
			detectSessionInUrl: isBrowser(),
			persistSession: true,
			storage: {
				// this client is used on the browser so cookies can be trusted
				isServer: false,
				getItem: async (key: string) => {
					const chunkedCookie = await combineChunks(key, async (chunkName) => {
						if (typeof cookies.get === 'function') {
							return await cookies.get(chunkName);
						}
						if (isBrowser()) {
							const cookie = parse(document.cookie);
							return cookie[chunkName];
						}
					});
					return chunkedCookie;
				},
				setItem: async (key: string, value: string) => {
					const chunks = await createChunks(key, value);
					await Promise.all(
						chunks.map(async (chunk) => {
							if (typeof cookies.set === 'function') {
								await cookies.set(chunk.name, chunk.value, {
									...DEFAULT_COOKIE_OPTIONS,
									...cookieOptions,
									maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
								});
							} else {
								if (isBrowser()) {
									document.cookie = serialize(chunk.name, chunk.value, {
										...DEFAULT_COOKIE_OPTIONS,
										...cookieOptions,
										maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
									});
								}
							}
						})
					);
				},
				removeItem: async (key: string) => {
					if (typeof cookies.remove === 'function' && typeof cookies.get !== 'function') {
						console.log(
							'Removing chunked cookie without a `get` method is not supported.\n\n\tWhen you call the `createBrowserClient` function from the `@supabase/ssr` package, make sure you declare both a `get` and `remove` method on the `cookies` object.\n\nhttps://supabase.com/docs/guides/auth/server-side/creating-a-client'
						);
						return;
					}

					await deleteChunks(
						key,
						async (chunkName) => {
							if (typeof cookies.get === 'function') {
								return await cookies.get(chunkName);
							}
							if (isBrowser()) {
								const documentCookies = parse(document.cookie);
								return documentCookies[chunkName];
							}
						},
						async (chunkName) => {
							if (typeof cookies.remove === 'function') {
								await cookies.remove(chunkName, {
									...DEFAULT_COOKIE_OPTIONS,
									...cookieOptions,
									maxAge: 0
								});
							} else {
								if (isBrowser()) {
									document.cookie = serialize(chunkName, '', {
										...DEFAULT_COOKIE_OPTIONS,
										...cookieOptions,
										maxAge: 0
									});
								}
							}
						}
					);
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
