import {
	CookieOptionsWithName,
	SupabaseClientOptionsWithoutAuth,
	createSupabaseClient
} from '@supabase/auth-helpers-shared';
import { RequestEvent } from '@sveltejs/kit';
import { SvelteKitServerAuthStorageAdapter } from './serverStorageAdapter';
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * ## Authenticated Supabase client
 * ### Handle
 *
 * ```ts
 * import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
 * import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
 * import type { Handle } from '@sveltejs/kit';
 *
 * export const handle: Handle = async ({ event, resolve }) => {
 *   event.locals.supabase = createSupabaseServerClient({
 *     supabaseUrl: PUBLIC_SUPABASE_URL,
 *     supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
 *     event
 *   });
 *
 *   event.locals.getSession = async () => {
 *     const {
 *       data: { session }
 *     } = await event.locals.supabase.auth.getSession();
 *     return session;
 *   };
 *
 *   return resolve(event, {
 *     filterSerializedResponseHeaders(name) {
 *       return name === 'content-range';
 *     }
 *   });
 * };
 * ```
 *
 * ### Types
 *
 * ```ts
 * import { SupabaseClient, Session } from '@supabase/supabase-js';
 *
 * declare global {
 *   namespace App {
 *     interface Locals {
 *       supabase: SupabaseClient;
 *       getSession(): Promise<Session | null>;
 *     }
 *     // interface PageData {}
 *     // interface Error {}
 *     // interface Platform {}
 *   }
 * }
 *
 * export {};
 * ```
 */
export function createSupabaseServerClient<
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
	options,
	cookieOptions,
	expiryMargin
}: {
	supabaseUrl: string;
	supabaseKey: string;
	event: Pick<RequestEvent, 'cookies'>;
	options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
	cookieOptions?: CookieOptionsWithName;
	expiryMargin?: number;
}): SupabaseClient<Database, SchemaName, Schema> {
	const client = createSupabaseClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, {
		...options,
		global: {
			...options?.global,
			headers: {
				...options?.global?.headers,
				'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
			}
		},
		auth: {
			storage: new SvelteKitServerAuthStorageAdapter(event, cookieOptions, expiryMargin)
		}
	});

	return client;
}
