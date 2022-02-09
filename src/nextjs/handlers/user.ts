import { ApiError, CookieOptions } from '../types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { setCookies } from '../../shared/utils/cookies';
import { createClient } from '@supabase/supabase-js';

export default async function handleUser(
  req: NextApiRequest,
  res: NextApiResponse,
  cookieOptions: CookieOptions
) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables are required!'
      );
    }
    if (!req.cookies) {
      throw new Error('Not able to parse cookies!');
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const access_token = req.cookies[`${cookieOptions.name}-access-token`];
    const refresh_token = req.cookies[`${cookieOptions.name}-refresh-token`];

    if (!access_token) {
      throw new Error('No cookie found!');
    }

    const { user, error: getUserError } = await supabase.auth.api.getUser(
      access_token
    );
    if (getUserError) {
      if (!refresh_token) throw new Error('No refresh_token cookie found!');
      if (!res)
        throw new Error(
          'You need to pass the res object to automatically refresh the session!'
        );
      const { data, error } = await supabase.auth.api.refreshAccessToken(
        refresh_token
      );
      if (error) {
        throw error;
      } else if (data) {
        setCookies(
          req,
          res,
          [
            { key: 'access-token', value: data.access_token },
            { key: 'refresh-token', value: data.refresh_token! }
          ].map((token) => ({
            name: `${cookieOptions.name}-${token.key}`,
            value: token.value,
            domain: cookieOptions.domain,
            maxAge: cookieOptions.lifetime ?? 0,
            path: cookieOptions.path,
            sameSite: cookieOptions.sameSite
          }))
        );
        res.status(200).json(user);
      }
    }
    res.status(200).json(user);
  } catch (e) {
    const error = e as ApiError;
    res.status(400).json({ error: error.message });
  }
}
