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
  error?: ErrorPayload | string;
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
