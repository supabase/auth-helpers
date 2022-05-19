import { ApiError, CookieOptions } from 'shared/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { jwtDecoder } from 'shared/utils/jwt';
import getUser from '../utils/getUser';
import { COOKIE_OPTIONS, TOKEN_REFRESH_MARGIN } from 'shared/utils/constants';

export interface HandleUserOptions {
  cookieOptions?: CookieOptions;
  tokenRefreshMargin?: number;
}

export default async function handleUser(
  req: NextApiRequest,
  res: NextApiResponse,
  options: HandleUserOptions = {}
) {
  try {
    if (!req.cookies) {
      throw new Error('Not able to parse cookies!');
    }
    const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
    const tokenRefreshMargin =
      options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
    const access_token = req.cookies[`${cookieOptions.name}-access-token`];

    if (!access_token) {
      throw new Error('No cookie found!');
    }

    // Get payload from cached access token.
    const jwtUser = jwtDecoder(access_token);
    if (!jwtUser?.exp) {
      throw new Error('Not able to parse JWT payload!');
    }
    const timeNow = Math.round(Date.now() / 1000);
    if (jwtUser.exp < timeNow + tokenRefreshMargin) {
      // JWT is expired, let's refresh from Gotrue
      const response = await getUser(
        { req, res },
        { cookieOptions, tokenRefreshMargin }
      );
      res.status(200).json(response);
    } else {
      // Transform JWT and add note that it ise cached from JWT.
      const user = {
        id: jwtUser.sub,
        aud: null,
        role: null,
        email: null,
        email_confirmed_at: null,
        phone: null,
        confirmed_at: null,
        last_sign_in_at: null,
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: null,
        updated_at: null,
        'supabase-auth-helpers-note':
          'This user payload is retrieved from the cached JWT and might be stale. If you need up to date user data, please call the `getUser` method in a server-side context!'
      };
      const mergedUser = { ...user, ...jwtUser };
      res.status(200).json({ user: mergedUser, accessToken: access_token });
    }
  } catch (e) {
    const error = e as ApiError;
    res
      .status(200)
      .json({ user: null, accessToken: null, error: error.message });
  }
}
