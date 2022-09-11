import type { SupabaseClient } from '@supabase/supabase-js';

export interface ClientConfig {
	supabaseClient: SupabaseClient;
	tokenRefreshMargin: number;
	endpointPrefix: string;
}

export interface ServerConfig extends ClientConfig {
	cookieName: string;
	cookieOptions: CookieOptions;
}

export interface CookieOptions {
	domain?: string;
	expires?: Date;
	httpOnly?: boolean;
	maxAge?: number;
	path?: string;
	priority?: 'low' | 'medium' | 'high';
	sameSite?: boolean | 'lax' | 'strict' | 'none';
	secure?: boolean;
}
