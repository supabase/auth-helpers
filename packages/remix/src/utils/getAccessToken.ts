import getUser from './getUser';
import { getSession } from './cookies';
import {
  CookieOptions,
  COOKIE_OPTIONS,
  jwtDecoder,
  TOKEN_REFRESH_MARGIN
} from '@supabase/auth-helpers-shared';
import { DataFunctionArgsWithResponse } from '../handlers/auth';

export interface GetAccessTokenOptions {
  cookieOptions?: CookieOptions;
  tokenRefreshMargin?: number;
}

export default async function getAccessToken(
  context: DataFunctionArgsWithResponse,
  options: GetAccessTokenOptions = {}
): Promise<string | null> {
  if (!context.request.headers.get('Cookie')) {
    throw new Error('Not able to parse cookies!');
  }

  const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
  const tokenRefreshMargin = options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
  const session = await getSession(context.request.headers.get('Cookie'));
  const access_token = session.get('accessToken');

  if (!access_token) {
    throw new Error('No cookie found!');
  }

  // Get payload from access token.
  const jwtUser = jwtDecoder(access_token);
  if (!jwtUser?.exp) {
    throw new Error('Not able to parse JWT payload!');
  }
  const timeNow = Math.round(Date.now() / 1000);
  if (jwtUser.exp < timeNow + tokenRefreshMargin) {
    // JWT is expired, let's refresh from Gotrue
    const { accessToken } = await getUser(context, {
      cookieOptions,
      tokenRefreshMargin
    });
    return accessToken;
  } else {
    return access_token;
  }
}
