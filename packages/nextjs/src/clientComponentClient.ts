import {
	BrowserCookieAuthStorageAdapter,
	CookieOptionsWithName,
	SupabaseClientOptionsWithoutAuth,
	createSupabaseClient
} from '@supabase/auth-helpers-shared';
import { SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | undefined;

export function createClientComponentClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database
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
} = {}) {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
		);
	}

	const _supabase =
		supabase ??
		createSupabaseClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
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
