import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse
} from 'next';
import getUser from './getUser';
import {
  AccessTokenNotFound,
  CookieNotParsed,
  CookieOptions,
  COOKIE_OPTIONS,
  jwtDecoder,
  JWTPayloadFailed,
  TOKEN_REFRESH_MARGIN
} from '@supabase/auth-helpers-shared';

export interface GetAccessTokenOptions {
  cookieOptions?: CookieOptions;
  tokenRefreshMargin?: number;
}

export default async function getAccessToken(
  context:
    | GetServerSidePropsContext
    | { req: NextApiRequest; res: NextApiResponse },
  options: GetAccessTokenOptions = {}
): Promise<string | null> {
  if (!context.req.cookies) {
    throw new CookieNotParsed();
  }
  const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
  const tokenRefreshMargin = options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
  const access_token =
    context.req.cookies[`${cookieOptions.name}-access-token`];

  if (!access_token) {
    throw new AccessTokenNotFound();
  }

  // Get payload from access token.
  const jwtUser = jwtDecoder(access_token);
  if (!jwtUser?.exp) {
    throw new JWTPayloadFailed();
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
