import {
  COOKIE_OPTIONS,
  TOKEN_REFRESH_MARGIN,
  ENDPOINT_PREFIX,
  type CookieOptions
} from '@supabase/auth-helpers-shared';
import { handleSession } from './session';
import { handleCallback } from './callback';
import { handleLogout } from './logout';
import { handleUser } from './user';

export interface HandleAuthOptions {
  cookieOptions?: CookieOptions;
  logout?: { returnTo?: string };
  tokenRefreshMargin?: number;
  endpointPrefix?: string;
}

export const handleAuth = (options: HandleAuthOptions = {}) => {
  const { logout } = options;
  const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
  const tokenRefreshMargin = options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
  const endpointPrefix = options.endpointPrefix ?? ENDPOINT_PREFIX;
  return [
    handleSession({ cookieOptions, tokenRefreshMargin }),
    handleCallback({ cookieOptions, endpointPrefix }),
    handleUser({ endpointPrefix }),
    handleLogout({ cookieOptions, endpointPrefix, ...logout })
  ];
};
