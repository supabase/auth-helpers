import { 
  CookieOptions, 
  setCookies, 
  COOKIE_OPTIONS, 
  NextRequestAdapter, 
  NextResponseAdapter 
} from '@supabase/auth-helpers-shared';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../utils/initSupabase';

export interface HandleLogoutOptions {
  cookieOptions?: CookieOptions;
  returnTo?: string;
}

export default function handleLogout(
  req: NextApiRequest,
  res: NextApiResponse,
  options: HandleLogoutOptions = {}
) {
  let { returnTo } = req.query;
  if (!returnTo) returnTo = options?.returnTo ?? '/';
  returnTo = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  returnTo = returnTo.charAt(0) === '/' ? returnTo : `/${returnTo}`;
  const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };

  // Logout request to Gotrue
  const access_token = req.cookies[`${cookieOptions.name}-access-token`];
  if (access_token) supabaseClient.auth.api.signOut(access_token);

  // Delete cookies
  setCookies(
    new NextRequestAdapter(req),
    new NextResponseAdapter(res),
    ['access-token', 'refresh-token', 'provider-token'].map((key) => ({
      name: `${cookieOptions.name}-${key}`,
      value: '',
      maxAge: -1
    }))
  );

  res.redirect(returnTo as string);
}
