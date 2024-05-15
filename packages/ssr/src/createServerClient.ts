import { createClient } from '@supabase/supabase-js';
import {
	DEFAULT_COOKIE_OPTIONS,
	combineChunks,
	createChunks,
	deleteChunks,
	isBrowser,
	isChunkLike
} from './utils';
import { createStorageFromOptions } from './common';

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

	const { storage, getAll, setAll, setItems, removedItems } = createStorageFromOptions(
		options || null,
		true
	);

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
			autoRefreshToken: false,
			detectSessionInUrl: false,
			persistSession: true,
			storage
		}
	});

	client.auth.onAuthStateChange(async (event) => {
		if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
			const allCookies = await getAll([
				...(setItems ? (Object.keys(setItems) as string[]) : []),
				...(removedItems ? (Object.keys(removedItems) as string[]) : [])
			]);
			const cookieNames = allCookies?.map(({ name }) => name) || [];

			const removeCookies: string[] = [];

			const setCookies = Object.keys(setItems).flatMap((itemName) => {
				const removeExistingCookiesForItem = new Set(
					cookieNames.filter((name) => isChunkLike(name, itemName))
				);

				const chunks = createChunks(itemName, setItems[itemName]);

				chunks.forEach((chunk) => {
					removeExistingCookiesForItem.delete(chunk.name);
				});

				removeCookies.push(...removeExistingCookiesForItem);

				return chunks;
			});

			const removeCookieOptions = {
				...DEFAULT_COOKIE_OPTIONS,
				...options?.cookieOptions,
				maxAge: 0
			};
			const setCookieOptions = {
				...DEFAULT_COOKIE_OPTIONS,
				...options?.cookieOptions,
				maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
			};

			await setAll([
				...removeCookies.map((name) => ({ name, value: '', options: removeCookieOptions })),
				...setCookies.map(({ name, value }) => ({ name, value, options: setCookieOptions }))
			]);
		}
	});

	return client;
}
