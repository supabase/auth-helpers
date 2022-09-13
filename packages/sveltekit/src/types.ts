import type { SupabaseClient, User } from '@supabase/supabase-js';

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

export interface SupabaseSession {
  user: User | null;
  accessToken: string | null;
}

export interface AuthenticatedSupabaseSession {
  user: User;
  accessToken: string | null;
}

export type ExtendedEvent = {
  getSupabaseClient(): SupabaseClient;
  session: AuthenticatedSupabaseSession;
};
