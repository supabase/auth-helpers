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
		useCookieChunking?: boolean;
	}
) {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			`Your project's URL and Key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`
		);
	}

	let cookies: CookieMethods = {};
	let isSingleton = true;
	let useCookieChunking = true;
	let cookieOptions: CookieOptionsWithName | undefined;
	let userDefinedClientOptions;

	if (options) {
		({
			cookies,
			isSingleton = true,
			useCookieChunking = true,
			cookieOptions,
			...userDefinedClientOptions
		} = options);
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
				getItem: async (key: string) => {
					if (typeof cookies.get === 'function') {
						if (useCookieChunking) {
							const chunkedCookie = await combineChunks(key, async (chunkName) => {
								// @ts-ignore we check this above
								return await cookies.get(chunkName);
							});
							return chunkedCookie;
						} else {
							return await cookies.get(key);
						}
					}

					if (isBrowser()) {
						if (useCookieChunking) {
							const chunkedCookie = await combineChunks(key, (chunkName) => {
								const documentCookies = parse(document.cookie);
								return documentCookies[chunkName];
							});
							return chunkedCookie;
						} else {
							const documentCookies = parse(document.cookie);
							return documentCookies[key];
						}
					}
				},
				setItem: async (key: string, value: string) => {
					if (typeof cookies.set === 'function') {
						if (useCookieChunking) {
							const chunks = await createChunks(key, value);
							await Promise.all(
								chunks.map(async (chunk) => {
									// @ts-ignore we check this above
									await cookies.set(chunk.name, chunk.value, {
										...DEFAULT_COOKIE_OPTIONS,
										...cookieOptions,
										maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
									});
								})
							);
						} else {
							return await cookies.set(key, value, {
								...DEFAULT_COOKIE_OPTIONS,
								...cookieOptions,
								maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
							});
						}
					}

					if (isBrowser()) {
						if (useCookieChunking) {
							const chunks = await createChunks(key, value);
							await Promise.all(
								chunks.map(async (chunk) => {
									document.cookie = serialize(chunk.name, chunk.value, {
										...DEFAULT_COOKIE_OPTIONS,
										...cookieOptions,
										maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
									});
								})
							);
						} else {
							document.cookie = serialize(key, value, {
								...DEFAULT_COOKIE_OPTIONS,
								...cookieOptions,
								maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
							});
						}
					}
				},
				removeItem: async (key: string) => {
					if (typeof cookies.remove === 'function') {
						if (useCookieChunking) {
							if (typeof cookies.get !== 'function') {
								throw new Error('Removing chunked cookie without a get method is not supported');
							}
							await deleteChunks(
								key,
								// @ts-ignore we check this above
								async (chunkName) => await cookies.get(chunkName),
								async (chunkName) =>
									// @ts-ignore we check this above
									await cookies.remove(chunkName, {
										...DEFAULT_COOKIE_OPTIONS,
										...cookieOptions,
										maxAge: 0
									})
							);
						} else {
							return await cookies.remove(key, {
								...DEFAULT_COOKIE_OPTIONS,
								...cookieOptions,
								maxAge: 0
							});
						}
					}

					if (isBrowser()) {
						if (useCookieChunking) {
							await deleteChunks(
								key,
								(chunkName) => {
									const documentCookies = parse(document.cookie);
									return documentCookies[chunkName];
								},
								(chunkName) => {
									document.cookie = serialize(chunkName, '', {
										...DEFAULT_COOKIE_OPTIONS,
										...cookieOptions,
										maxAge: 0
									});
								}
							);
						} else {
							document.cookie = serialize(key, '', {
								...DEFAULT_COOKIE_OPTIONS,
								...cookieOptions,
								maxAge: 0
							});
						}
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
