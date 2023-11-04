import {
	CookieOptionsWithName,
	createSupabaseClient,
	isBrowser,
	SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { LoadEvent } from '@sveltejs/kit';
import { SvelteKitLoadAuthStorageAdapter } from './loadStorageAdapter';
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';

let cachedBrowserClient: SupabaseClient<any, string> | undefined;

/**
 * ## Authenticated Supabase client
 *
 * Returns a new authenticated Supabase client.
 *
 * When running in the browser it will create a single instance
 * that is returned for subsequent runs.
 *
 * ### Example:
 *
 * ```ts
 * import { invalidate } from '$app/navigation';
 * import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
 * import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
 * import type { LayoutLoad } from './$types';
 *
 * export const load: LayoutLoad = async ({ fetch, data, depends }) => {
 *   depends('supabase:auth');
 *
 *   const supabase = createSupabaseLoadClient({
 *     supabaseUrl: PUBLIC_SUPABASE_URL,
 *     supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
 *     event: { fetch },
 *     serverSession: data.session,
 *     onAuthStateChange() {
 *       invalidate('supabase:auth');
 *     }
 *   });
 *
 *   const {
 *     data: { session }
 * 	} = await supabase.auth.getSession();
 *
 *   return { supabase, session };
 * };
 *
 * ```
 */
export function createSupabaseLoadClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>({
	supabaseUrl,
	supabaseKey,
	event,
	serverSession,
	options,
	cookieOptions
}: {
	supabaseUrl: string;
	/**
	 * The supabase key. Make sure you **always** use the ANON_KEY.
	 */
	supabaseKey: string;
	event: Pick<LoadEvent, 'fetch'>;
	/**
	 * The initial session from the server.
	 */
	serverSession: Session | null;
	options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
	cookieOptions?: CookieOptionsWithName;
}): SupabaseClient<Database, SchemaName, Schema> {
	const browser = isBrowser();
	if (browser && cachedBrowserClient) {
		return cachedBrowserClient as SupabaseClient<Database, SchemaName, Schema>;
	}
	const client = createSupabaseClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, {
		...options,
		global: {
			fetch: event.fetch,
			...options?.global,
			headers: {
				...options?.global?.headers,
				'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
			}
		},
		auth: {
			storage: new SvelteKitLoadAuthStorageAdapter(serverSession, cookieOptions)
		}
	});

	if (browser) {
		cachedBrowserClient = client;
	}

	return client;
}
