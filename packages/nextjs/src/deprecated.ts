import {
	SupabaseClientOptionsWithoutAuth,
	CookieOptionsWithName
} from '@supabase/auth-helpers-shared';
import { createPagesBrowserClient } from './pagesBrowserClient';
import { createPagesServerClient } from './pagesServerClient';
import { NextResponse } from 'next/server';
import { createMiddlewareClient } from './middlewareClient';
import { createClientComponentClient } from './clientComponentClient';

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
		'Please utilize the `createPagesBrowserClient` function instead of the deprecated `createBrowserSupabaseClient` function.'
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
		'Please utilize the `createPagesServerClient` function instead of the deprecated `createServerSupabaseClient` function.'
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
		'Please utilize the `createMiddlewareClient function instead of the deprecated `createMiddlewareSupabaseClient` function.'
	);

	return createMiddlewareClient<Database, SchemaName, Schema>(context, {
		supabaseUrl,
		supabaseKey,
		options,
		cookieOptions
	});
}
