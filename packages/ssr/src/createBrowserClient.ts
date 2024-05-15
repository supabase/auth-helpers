import { createClient } from '@supabase/supabase-js';
import {
	DEFAULT_COOKIE_OPTIONS,
	combineChunks,
	createChunks,
	deleteChunks,
	isBrowser,
	isChunkLike
} from './utils';
import { parse, serialize } from 'cookie';

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	GenericSchema,
	SupabaseClientOptions
} from '@supabase/supabase-js/dist/module/lib/types';
import type {
	CookieMethodsBrowser,
	CookieOptions,
	CookieOptionsWithName,
	GetAllCookies,
	SetAllCookies
} from './types';
import { createStorageFromOptions } from './common';

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
		cookies?: CookieMethodsBrowser;
		cookieOptions?: CookieOptionsWithName;
		isSingleton?: boolean;
	}
) {
	if ((options?.isSingleton || isBrowser()) && cachedBrowserClient) {
		return cachedBrowserClient;
	}

	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			`@supabase/ssr: Your project's URL and Key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`
		);
	}

	const { storage } = createStorageFromOptions(options || null, false);

	const client = createClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, {
		...options,
		global: {
			...options?.global,
			headers: {
				...options?.global?.headers,
				'X-Client-Info': `${PACKAGE_NAME}/${PACKAGE_VERSION}`
			}
		},
		auth: {
			...(options?.cookieOptions?.name ? { storageKey: options.cookieOptions.name } : null),
			...options?.auth,
			flowType: 'pkce',
			autoRefreshToken: isBrowser(),
			detectSessionInUrl: isBrowser(),
			persistSession: true,
			storage
		}
	});

	if (options?.isSingleton || isBrowser()) {
		cachedBrowserClient = client;
	}

	return client;
}
