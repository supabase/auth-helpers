import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { CookieOptions } from '@supabase/auth-helpers-shared';

// Types
export type { Session, User, SupabaseClient } from '@supabase/supabase-js';

// TODO! Remove this one 👇 when Next.js update their types for Route Handlers and Server Actions
export type WritableRequestCookies = ReadonlyRequestCookies & {
	set: (name: string, value: string, options?: CookieOptions) => void;
};

export { createPagesBrowserClient } from './pagesBrowserClient';
export { createPagesServerClient } from './pagesServerClient';
export { createMiddlewareClient } from './middlewareClient';
export { createClientComponentClient } from './clientComponentClient';
export { createServerComponentClient } from './serverComponentClient';
export { createRouteHandlerClient } from './routeHandlerClient';
export { createServerActionClient } from './serverActionClient';
