import type { SupabaseClient, User } from '@supabase/supabase-js';

export interface SharedConfig {
  supabaseClient: SupabaseClient;
  tokenRefreshMargin: number;
  endpointPrefix: string;
}

export interface ClientConfig extends SharedConfig {
  getSessionFromPageData: (data: App.PageData) => SupabaseSession;
}

export interface ServerConfig extends SharedConfig {
  cookieName: string;
  cookieOptions: CookieOptions;
  getSessionFromLocals: (locals: App.Locals) => SupabaseSession;
  setSessionToLocals: (locals: App.Locals, session: SupabaseSession) => void;
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

export interface AuthenticatedSupabaseSession {
  user: User;
  accessToken: string;
}

export type SupabaseSession = null | AuthenticatedSupabaseSession;

export type ExtendedEvent = {
  getSupabaseClient(): SupabaseClient;
  session: SupabaseSession;
};

export interface SetupClientOptions {
  supabaseClient: SupabaseClient;
  tokenRefreshMargin?: number;
  endpointPrefix?: string;
  getSessionFromPageData?: (data: App.PageData) => SupabaseSession;
}

export interface SetupServerOptions {
  supabaseClient: SupabaseClient;
  tokenRefreshMargin?: number;
  endpointPrefix?: string;
  cookieName?: string;
  cookieOptions?: CookieOptions;
  getSessionFromLocals?: (locals: App.Locals) => SupabaseSession;
  setSessionToLocals?: (locals: App.Locals, session: SupabaseSession) => void;
}
