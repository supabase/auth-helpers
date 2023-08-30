import {
	CookieAuthStorageAdapter,
	CookieOptions,
	CookieOptionsWithName,
	SupabaseClientOptionsWithoutAuth,
	createSupabaseClient
} from './';

import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

type CookieStore = {
	get: (key: string) => string | undefined;
	set: (key: string, value: string, options: CookieOptions) => void;
	delete: (key: string) => void;
};

class ServerCookieAuthStorageAdapter extends CookieAuthStorageAdapter {
	constructor(private readonly cookies: CookieStore, cookieOptions?: CookieOptions) {
		super(cookieOptions);
	}

	protected getCookie(name: string): string | null | undefined {
		return this.cookies.get(name);
	}
	protected setCookie(name: string, value: string): void {
		this.cookies.set(name, value, this.cookieOptions);
	}
	protected deleteCookie(name: string): void {
		this.cookies.delete(name);
	}
}

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
	options: SupabaseClientOptionsWithoutAuth<SchemaName> & {
		cookieOptions?: CookieOptionsWithName;
		cookies: CookieStore;
	}
): SupabaseClient<Database, SchemaName, Schema> {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error('supabaseUrl and supabaseKey are required!');
	}

	return createSupabaseClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, {
		...options,
		global: {
			...options?.global,
			headers: {
				...options?.global?.headers,
				'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
			}
		},
		auth: {
			storageKey: options.cookieOptions?.name,
			storage: new ServerCookieAuthStorageAdapter(options.cookies, options?.cookieOptions)
		}
	});
}
