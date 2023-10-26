import { createClient } from '@supabase/supabase-js';
import { mergeDeepRight } from 'ramda';
import { DEFAULT_COOKIE_OPTIONS, isBrowser } from './utils';

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
						return cookies.get(key);
					}
				},
				setItem: async (key: string, value: string) => {
					if (typeof cookies.set === 'function') {
						await cookies.set(key, value, {
							...DEFAULT_COOKIE_OPTIONS,
							...cookieOptions,
							maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
						});
					}
				},
				removeItem: async (key: string) => {
					if (typeof cookies.remove === 'function') {
						await cookies.remove(key, { ...DEFAULT_COOKIE_OPTIONS, ...cookieOptions, maxAge: 0 });
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

	return createClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, clientOptions);
}
