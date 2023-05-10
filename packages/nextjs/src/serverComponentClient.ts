import {
	CookieAuthStorageAdapter,
	CookieOptions,
	CookieOptionsWithName,
	SupabaseClientOptionsWithoutAuth,
	createSupabaseClient
} from '@supabase/auth-helpers-shared';

class NextServerComponentAuthStorageAdapter extends CookieAuthStorageAdapter {
	constructor(
		private readonly context: {
			cookies: () => any; // TODO update this to be ReadonlyHeaders when we upgrade to Next.js 13
		},
		cookieOptions?: CookieOptions
	) {
		super(cookieOptions);
	}

	protected getCookie(name: string): string | null | undefined {
		const nextCookies = this.context.cookies();
		return nextCookies.get(name)?.value;
	}
	protected setCookie(name: string, value: string): void {
		// Note: The Next.js team at Vercel is working on adding the ability to
		// set cookies in addition to the cookies function.
		// https://beta.nextjs.org/docs/api-reference/cookies
	}
	protected deleteCookie(name: string): void {
		// Note: The Next.js team at Vercel is working on adding the ability to
		// set cookies in addition to the cookies function.
		// https://beta.nextjs.org/docs/api-reference/cookies
	}
}

export const createRouteHandlerSupabaseClient = createServerComponentSupabaseClient;

export function createServerComponentSupabaseClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database
>(
	context: {
		cookies: () => any; // TODO update this to be ReadonlyHeaders when we upgrade to Next.js 13
	},
	{
		supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
		supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		options,
		cookieOptions
	}: {
		supabaseUrl?: string;
		supabaseKey?: string;
		options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
		cookieOptions?: CookieOptionsWithName;
	} = {}
) {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
		);
	}

	return createSupabaseClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
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
			storage: new NextServerComponentAuthStorageAdapter(context, cookieOptions)
		}
	});
}
