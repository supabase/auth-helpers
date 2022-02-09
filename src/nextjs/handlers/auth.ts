import { CookieOptions } from '../types';
import type { NextApiRequest, NextApiResponse } from 'next';
import handelCallback from './callback';
import handleUser from './user';

export default function handleAuth(
  cookieOptions: CookieOptions = {
    name: 'sb',
    lifetime: 60 * 60 * 8,
    domain: '',
    path: '/',
    sameSite: 'lax'
  }
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
        return handleUser(req, res, cookieOptions);
      default:
        res.status(404).end();
    }
  };
}
