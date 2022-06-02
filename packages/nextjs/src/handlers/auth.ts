import { CookieOptions, COOKIE_OPTIONS, TOKEN_REFRESH_MARGIN } from '@supabase/auth-helpers-shared';
import type { NextApiRequest, NextApiResponse } from 'next';
import handelCallback from './callback';
import handleUser from './user';
import handleLogout from './logout';

export interface HandleAuthOptions {
  cookieOptions?: CookieOptions;
  logout?: { returnTo?: string };
  tokenRefreshMargin?: number;
}

export default function handleAuth(options: HandleAuthOptions = {}) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const { logout } = options;
    const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
    const tokenRefreshMargin =
      options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
    let {
      query: { supabase: route }
    } = req;

    route = Array.isArray(route) ? route[0] : route;

    switch (route) {
      case 'callback':
        return handelCallback(req, res, { cookieOptions });
      case 'user':
        return await handleUser(req, res, {
          cookieOptions,
          tokenRefreshMargin
        });
      case 'logout':
        return handleLogout(req, res, {
          cookieOptions,
          ...logout
        });
      default:
        res.status(404).end();
    }
  };
}
