import {
	SupabaseClientOptionsWithoutAuth,
	CookieOptionsWithName
} from '@supabase/auth-helpers-shared';
import { NextResponse } from 'next/server';
import { createPagesBrowserClient } from './pagesBrowserClient';
import { createPagesServerClient } from './pagesServerClient';
import { createMiddlewareClient } from './middlewareClient';
import { createClientComponentClient } from './clientComponentClient';
import { createServerComponentClient } from './serverComponentClient';
import { createRouteHandlerClient } from './routeHandlerClient';
import { headers, cookies } from 'next/headers';

import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest } from 'next/server';
import type { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';

/**
 * @deprecated utilize the `createPagesBrowserClient` function instead
 */
export function createBrowserSupabaseClient<
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
} = {}) {
	console.warn(
		'Please utilize the `createPagesBrowserClient` function instead of the deprecated `createBrowserSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs-pages'
	);
	return createPagesBrowserClient<Database, SchemaName, Schema>({
		supabaseUrl,
		supabaseKey,
		options,
		cookieOptions
	});
}

/**
 * @deprecated utilize the `createPagesServerClient` function instead
 */
export function createServerSupabaseClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	context: GetServerSidePropsContext | { req: NextApiRequest; res: NextApiResponse },
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
	console.warn(
		'Please utilize the `createPagesServerClient` function instead of the deprecated `createServerSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs-pages'
	);
	return createPagesServerClient<Database, SchemaName, Schema>(context, {
		supabaseUrl,
		supabaseKey,
		options,
		cookieOptions
	});
}

/**
 * @deprecated utilize the `createMiddlewareClient` function instead
 */
export function createMiddlewareSupabaseClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	context: { req: NextRequest; res: NextResponse },
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
	console.warn(
		'Please utilize the `createMiddlewareClient` function instead of the deprecated `createMiddlewareSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#middleware'
	);

	return createMiddlewareClient<Database, SchemaName, Schema>(context, {
		supabaseUrl,
		supabaseKey,
		options,
		cookieOptions
	});
}

/**
 * @deprecated utilize the `createClientComponentClient` function instead
 */
export function createClientComponentSupabaseClient<
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
} = {}) {
	console.warn(
		'Please utilize the `createClientComponentClient` function instead of the deprecated `createClientComponentSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#client-component'
	);

	return createClientComponentClient<Database, SchemaName, Schema>({
		supabaseUrl,
		supabaseKey,
		options,
		cookieOptions
	});
}

/**
 * @deprecated utilize the `createServerComponentClient` function instead
 */
export function createServerComponentSupabaseClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	context: {
		headers: () => ReturnType<typeof headers>;
		cookies: () => ReturnType<typeof cookies>;
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
	console.warn(
		'Please utilize the `createServerComponentClient` function instead of the deprecated `createServerComponentSupabaseClient` function. Additionally, this function no longer requires the `headers` function as a parameter. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#server-component'
	);

	return createServerComponentClient<Database, SchemaName, Schema>(
		{ cookies: context.cookies },
		{
			supabaseUrl,
			supabaseKey,
			options,
			cookieOptions
		}
	);
}

/**
 * @deprecated utilize the `createRouteHandlerClient` function instead
 */
export function createRouteHandlerSupabaseClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	context: { headers: () => ReturnType<typeof headers>; cookies: () => ReturnType<typeof cookies> },
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
	console.warn(
		'Please utilize the `createRouteHandlerClient` function instead of the deprecated `createRouteHandlerSupabaseClient` function. Additionally, this function no longer requires the `headers` function as a parameter. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#route-handler'
	);

	return createRouteHandlerClient<Database, SchemaName, Schema>(
		{ cookies: context.cookies },
		{
			supabaseUrl,
			supabaseKey,
			options,
			cookieOptions
		}
	);
}
