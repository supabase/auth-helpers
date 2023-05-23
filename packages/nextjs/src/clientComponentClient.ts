import {
	BrowserCookieAuthStorageAdapter,
	CookieOptionsWithName,
	SupabaseClientOptionsWithoutAuth,
	createSupabaseClient
} from '@supabase/auth-helpers-shared';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';

// can't type this properly as `Database`, `SchemaName` and `Schema` are only available within `createClientComponentClient` function
let supabase: any;

export function createClientComponentClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>({
	supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
	supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	options,
	cookieOptions
}: {
	supabaseUrl?: string;
	supabaseKey?: string;
	options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
	cookieOptions?: CookieOptionsWithName;
} = {}): SupabaseClient<Database, SchemaName, Schema> {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
		);
	}

	const _supabase =
		supabase ??
		createSupabaseClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, {
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
				storage: new BrowserCookieAuthStorageAdapter(cookieOptions)
			}
		});

	// For SSG and SSR always create a new Supabase client
	if (typeof window === 'undefined') return _supabase;
	// Create the Supabase client once in the client
	if (!supabase) supabase = _supabase;

	return supabase;
}
