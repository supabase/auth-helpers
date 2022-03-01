import { CookieOptions } from '../types';
import type { NextApiRequest, NextApiResponse } from 'next';
import handelCallback from './callback';
import handleUser from './user';
import handleLogout from './logout';
import { COOKIE_OPTIONS } from '../utils/constants';

export default function handleAuth(
  cookieOptions: CookieOptions = COOKIE_OPTIONS
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    let {
      query: { supabase: route }
    } = req;

    route = Array.isArray(route) ? route[0] : route;

    switch (route) {
      case 'callback':
        return handelCallback(req, res, cookieOptions);
      case 'user':
        return await handleUser(req, res, cookieOptions);
      case 'logout':
        return await handleLogout(req, res, cookieOptions);
      default:
        res.status(404).end();
    }
  };
}
