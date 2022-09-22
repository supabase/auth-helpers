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

/** Recognized JWT Claims Set members, any other members may also be present. */
export interface JWTPayload {
  /** JWT Issuer - [RFC7519#section-4.1.1](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1). */
  iss?: string;

  /** JWT Subject - [RFC7519#section-4.1.2](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2). */
  sub?: string;

  /** JWT Audience [RFC7519#section-4.1.3](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3). */
  aud?: string | string[];

  /** JWT ID - [RFC7519#section-4.1.7](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7). */
  jti?: string;

  /** JWT Not Before - [RFC7519#section-4.1.5](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5). */
  nbf?: number;

  /** JWT Expiration Time - [RFC7519#section-4.1.4](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4). */
  exp?: number;

  /** JWT Issued At - [RFC7519#section-4.1.6](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6). */
  iat?: number;

  /** Any other JWT Claim Set member. */
  [propName: string]: unknown;
}
