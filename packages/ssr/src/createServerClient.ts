import { createClient } from '@supabase/supabase-js';
import { mergeDeepRight } from 'ramda';
import {
	DEFAULT_COOKIE_OPTIONS,
	combineChunks,
	createChunks,
	deleteChunks,
	isBrowser
} from './utils';

import type {
	GenericSchema,
	SupabaseClientOptions
} from '@supabase/supabase-js/dist/module/lib/types';
import type { CookieOptionsWithName, CookieMethods } from './types';

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
		cookies: CookieMethods;
		cookieOptions?: CookieOptionsWithName;
	}
) {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			`Your project's URL and Key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`
		);
	}

	const { cookies, cookieOptions, ...userDefinedClientOptions } = options;

	const storageKey = cookieOptions?.name;
	delete cookieOptions?.name;

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
			storageKey,
			storage: {
				getItem: async (key: string) => {
					const chunkedCookie = await combineChunks(key, async (chunkName: string) => {
						if (typeof cookies.get === 'function') {
							return await cookies.get(chunkName);
						}
					});
					return chunkedCookie;
				},
				setItem: async (key: string, value: string) => {
					const chunks = createChunks(key, value);
					await Promise.all(
						chunks.map(async (chunk) => {
							if (typeof cookies.set === 'function') {
								await cookies.set(chunk.name, chunk.value, {
									...DEFAULT_COOKIE_OPTIONS,
									...cookieOptions,
									maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
								});
							}
						})
					);
				},
				removeItem: async (key: string) => {
					if (typeof cookies.remove === 'function' && typeof cookies.get !== 'function') {
						console.log(
							'Removing chunked cookie without a `get` method is not supported.\n\n\tWhen you call the `createServerClient` function from the `@supabase/ssr` package, make sure you declare both a `get` and `remove` method on the `cookies` object.\n\nhttps://supabase.com/docs/guides/auth/server-side/creating-a-client'
						);
						return;
					}

					deleteChunks(
						key,
						async (chunkName) => {
							if (typeof cookies.get === 'function') {
								return await cookies.get(chunkName);
							}
						},
						async (chunkName) => {
							if (typeof cookies.remove === 'function') {
								return await cookies.remove(chunkName, {
									...DEFAULT_COOKIE_OPTIONS,
									...cookieOptions,
									maxAge: 0
								});
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

	return createClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, clientOptions);
}
