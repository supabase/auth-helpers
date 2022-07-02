import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse
} from 'next';
import { User, createClient } from '@supabase/supabase-js';
import {
  ApiError,
  CookieOptions,
  setCookies,
  COOKIE_OPTIONS,
  TOKEN_REFRESH_MARGIN,
  NextRequestAdapter,
  NextResponseAdapter,
  jwtDecoder,
  CookieNotParsed,
  JWTPayloadFailed,
  AccessTokenNotFound,
  RefreshTokenNotFound,
  AuthHelperError
} from '@supabase/auth-helpers-shared';
import log from 'loglevel';

export interface GetUserOptions {
  cookieOptions?: CookieOptions;
  forceRefresh?: boolean;
  tokenRefreshMargin?: number;
}

export default async function getUser(
  context:
    | GetServerSidePropsContext
    | { req: NextApiRequest; res: NextApiResponse },
  options: GetUserOptions = { forceRefresh: false }
): Promise<{ user: User | null; accessToken: string | null; error?: string }> {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables are required!'
      );
    }
    if (!context.req.cookies) {
      throw new CookieNotParsed();
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
    const tokenRefreshMargin =
      options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
    const access_token =
      context.req.cookies[`${cookieOptions.name}-access-token`];
    const refresh_token =
      context.req.cookies[`${cookieOptions.name}-refresh-token`];

    if (!access_token) {
      throw new AccessTokenNotFound();
    }
    // Get payload from access token.
    const jwtUser = jwtDecoder(access_token);
    if (!jwtUser?.exp) {
      throw new JWTPayloadFailed();
    }
    const timeNow = Math.round(Date.now() / 1000);
    if (options.forceRefresh || jwtUser.exp < timeNow + tokenRefreshMargin) {
      // JWT is expired, let's refresh from Gotrue
      if (!refresh_token) throw new RefreshTokenNotFound();
      const { data, error } = await supabase.auth.api.refreshAccessToken(
        refresh_token
      );
      if (error) {
        throw error;
      } else {
        setCookies(
          new NextRequestAdapter(context.req),
          new NextResponseAdapter(context.res),
          [
            { key: 'access-token', value: data!.access_token },
            { key: 'refresh-token', value: data!.refresh_token! }
          ].map((token) => ({
            name: `${cookieOptions.name}-${token.key}`,
            value: token.value,
            domain: cookieOptions.domain,
            maxAge: cookieOptions.lifetime ?? 0,
            path: cookieOptions.path,
            sameSite: cookieOptions.sameSite
          }))
        );
        return { user: data!.user!, accessToken: data!.access_token };
      }
    } else {
      const { user, error: getUserError } = await supabase.auth.api.getUser(
        access_token
      );
      if (getUserError) {
        throw getUserError;
      }
      return { user: user!, accessToken: access_token };
    }
  } catch (e) {
    const error = e as ApiError;
    if (e instanceof AuthHelperError) {
      log.debug(e.toObj());
    }
    return { user: null, accessToken: null, error: error.message };
  }
}
