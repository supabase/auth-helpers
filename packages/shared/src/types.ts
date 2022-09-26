import type { ApiError, User } from '@supabase/supabase-js';
import { ErrorPayload } from './utils/errors';

export type UserFetcher = (url: string) => Promise<{
  user: User | null;
  accessToken: string | null;
  error?: string | null;
}>;

export type UserState = {
  user: User | null;
  accessToken: string | null;
  error?: ErrorPayload;
  isLoading: boolean;
  checkSession: () => Promise<void>;
};

export interface CookieOptions {
  // (Optional) The Cookie name prefix. Defaults to `sb` meaning the cookies will be `sb-access-token` and `sb-refresh-token`.
  name?: string;
  // (Optional) The cookie lifetime (expiration) in seconds. Set to 8 hours by default.
  lifetime?: number;
  // (Optional) The cookie domain this should run on. Leave it blank to restrict it to your domain.
  domain?: string;
  path?: string;
  // (Optional) SameSite configuration for the session cookie. Defaults to 'lax', but can be changed to 'strict' or 'none'. Set it to false if you want to disable the SameSite setting.
  sameSite?: string;
}

export type { ApiError, User };

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
