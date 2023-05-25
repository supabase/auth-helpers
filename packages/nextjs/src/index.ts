// Types
export type { Session, User, SupabaseClient } from '@supabase/supabase-js';

export { createPagesBrowserClient } from './pagesBrowserClient';
export { createPagesServerClient } from './pagesServerClient';
export { createMiddlewareClient } from './middlewareClient';
export { createClientComponentClient } from './clientComponentClient';
export { createServerComponentClient } from './serverComponentClient';
export { createRouteHandlerClient } from './routeHandlerClient';
export { createServerActionClient } from './serverActionClient';

// Deprecated Functions
export {
	createBrowserSupabaseClient,
	createServerSupabaseClient,
	createMiddlewareSupabaseClient
} from './deprecated';
