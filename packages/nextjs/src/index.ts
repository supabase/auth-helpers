import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { CookieOptions } from '@supabase/auth-helpers-shared';

// Types
export type { Session, User, SupabaseClient } from '@supabase/supabase-js';

// TODO! Remove this one 👇 when Next.js update their types for Route Handlers and Server Actions
export type WritableRequestCookies = ReadonlyRequestCookies & {
	set: (name: string, value: string, options?: CookieOptions) => void;
};

export { createBrowserSupabaseClient } from './browserClient';
export { createServerSupabaseClient } from './serverClient';
export { createMiddlewareSupabaseClient } from './middlewareClient';
export { createServerComponentSupabaseClient } from './serverComponentClient';
export { createRouteHandlerSupabaseClient } from './routeHandlerClient';
export { createServerActionSupabaseClient } from './serverActionClient';
