import { COOKIE_OPTIONS, TOKEN_REFRESH_MARGIN, type CookieOptions } from "@supabase/auth-helpers-shared";
import { handleCallback } from "./callback";
import { handleLogout } from "./logout";
import { handleUser } from "./user";

export interface HandleAuthOptions {
  cookieOptions?: CookieOptions;
  logout?: { returnTo?: string };
  tokenRefreshMargin?: number;
}

export const handleAuth = (options: HandleAuthOptions = {}) => {
  const { logout } = options;
  const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
  const tokenRefreshMargin =
    options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
  return [
    handleCallback({ cookieOptions }), 
    handleUser({ cookieOptions, tokenRefreshMargin }), 
    handleLogout({ cookieOptions, ...logout })
  ];
}