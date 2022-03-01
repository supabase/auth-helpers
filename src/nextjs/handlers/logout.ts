import { CookieOptions } from '../types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { setCookies } from '../../shared/utils/cookies';
import {
  NextRequestAdapter,
  NextResponseAdapter
} from '../../shared/adapters/NextAdapter';
import { supabaseClient } from '../utils/initSupabase';

export default function handleLogout(
  req: NextApiRequest,
  res: NextApiResponse,
  cookieOptions: CookieOptions
) {
  const { returnTo = '/' } = req.query;

  // Logout request to Gotrue
  const access_token = req.cookies[`${cookieOptions.name}-access-token`];
  if (access_token) supabaseClient.auth.api.signOut(access_token);

  // Delete cookies
  setCookies(
    new NextRequestAdapter(req),
    new NextResponseAdapter(res),
    ['access-token', 'refresh-token'].map((key) => ({
      name: `${cookieOptions.name}-${key}`,
      value: '',
      maxAge: -1
    }))
  );

  res.redirect(returnTo as string);
}
