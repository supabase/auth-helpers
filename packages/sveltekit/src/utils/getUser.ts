import { createClient, type ApiError } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { createSupabaseClient } from '../instance';
import {
  setCookies,
  parseCookie,
  COOKIE_OPTIONS,
  type CookieOptions,
  SvelteKitRequestAdapter,
  SvelteKitResponseAdapter,
  jwtDecoder,
  TOKEN_REFRESH_MARGIN,
  CookieNotParsed,
  AccessTokenNotFound,
  JWTPayloadFailed,
  RefreshTokenNotFound,
  AuthHelperError,
  CookieNotSaved,
  CookieNotFound,
  type ErrorPayload
} from '@supabase/auth-helpers-shared';
import type { RequestResponse } from '../types';
import logger from './log';
import { PKG_NAME, PKG_VERSION } from '../constants';

export interface GetUserOptions {
  cookieOptions?: CookieOptions;
  forceRefresh?: boolean;
  tokenRefreshMargin?: number;
}

interface UserResponse {
  user: User | null;
  accessToken: string | null;
  refreshToken?: string;
  error?: ErrorPayload | string;
}

/**
 * Get a user from a cookie or from the supabase API
 * Note: This function no longer saves the token into a cookie, for this
 * you will need to use the getUserAndSaveTokens function instead.
 * @param req Request
 * @param options GetUserOptions
 * @returns Promise<UserResponse>
 */
export async function getUser(
  req: Request,
  options: GetUserOptions = { forceRefresh: false }
): Promise<UserResponse> {
  try {
    const {
      apiInfo: { supabaseUrl, supabaseAnonKey }
    } = createSupabaseClient();
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'supabaseUrl and supabaseAnonKey env variables are required!'
      );
    }

    if (!req.headers.has('cookie')) {
      throw new CookieNotFound();
    }

    const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
    const tokenRefreshMargin =
      options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;

    const cookies = parseCookie(req.headers.get('cookie'));
    if (!cookies) {
      throw new CookieNotParsed();
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      headers: {
        'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
      }
    });
    const access_token = cookies[`${cookieOptions.name}-access-token`];
    const refresh_token = cookies[`${cookieOptions.name}-refresh-token`];

    if (!access_token) {
      throw new AccessTokenNotFound();
    }

    // if we have a token, set the client to use it so we can make authorized requests to Supabase
    supabase.auth.setAuth(access_token);

    // Get payload from access token.
    const jwtUser = jwtDecoder(access_token);
    if (!jwtUser?.exp) {
      throw new JWTPayloadFailed();
    }
    const timeNow = Math.round(Date.now() / 1000);
    if (options.forceRefresh || jwtUser.exp < timeNow + tokenRefreshMargin) {
      // JWT is expired, let's refresh from Gotrue
      if (!refresh_token) {
        throw new RefreshTokenNotFound();
      }

      logger.info('Refreshing access token...');
      const { data, error } = await supabase.auth.api.refreshAccessToken(
        refresh_token
      );

      if (error) {
        throw error;
      }
      return {
        user: data!.user!,
        accessToken: data!.access_token,
        refreshToken: data?.refresh_token
      };
    } else {
      logger.info('Getting the user object from the database...');
      const { user, error: getUserError } = await supabase.auth.api.getUser(
        access_token
      );
      if (getUserError) {
        throw getUserError;
      }
      return { user, accessToken: access_token };
    }
  } catch (e) {
    let response: UserResponse = { user: null, accessToken: null };
    if (e instanceof JWTPayloadFailed) {
      logger.info('JWTPayloadFailed error has happened!');
      response.error = e.toObj();
    } else if (e instanceof AuthHelperError) {
      // do nothing, these are all just to disrupt the control flow
    } else {
      const error = e as ApiError;
      logger.error(error.message);
    }

    return response;
  }
}

export function saveTokens(
  { req, res }: RequestResponse,
  session: UserResponse,
  options: GetUserOptions = { forceRefresh: false }
) {
  try {
    if (session.error) {
      throw new CookieNotSaved();
    }
    const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
    const tokenRefreshMargin =
      options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;

    const cookies = parseCookie(req.headers.get('cookie'));
    const access_token = cookies[`${cookieOptions.name}-access-token`];
    const refresh_token = cookies[`${cookieOptions.name}-refresh-token`];

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
      if (!refresh_token) {
        throw new RefreshTokenNotFound();
      }

      logger.info('Saving tokens to cookies...');
      setCookies(
        new SvelteKitRequestAdapter(req),
        new SvelteKitResponseAdapter(res),
        [
          { key: 'access-token', value: session!.accessToken! },
          { key: 'refresh-token', value: session!.refreshToken! }
        ].map((token) => ({
          name: `${cookieOptions.name}-${token.key}`,
          value: token.value,
          domain: cookieOptions.domain,
          maxAge: cookieOptions.lifetime ?? 0,
          path: cookieOptions.path,
          sameSite: cookieOptions.sameSite
        }))
      );
      return { user: session.user, accessToken: session.accessToken };
    }
  } catch (e) {
    let response: UserResponse = { user: null, accessToken: null };
    if (e instanceof JWTPayloadFailed) {
      logger.info('JWTPayloadFailed error has happened!');
      response.error = e.toObj();
    } else if (e instanceof AuthHelperError) {
      logger.info('AuthHelperError error has happened!');
      logger.error(e.toString());
    } else {
      const error = e as ApiError;
      logger.error(error.message);
    }
    return response;
  }
}

export default async function getUserAndSaveTokens(
  { req, res }: RequestResponse,
  options: GetUserOptions = { forceRefresh: false }
): Promise<UserResponse> {
  const session = await getUser(req, options);
  await saveTokens({ req, res }, session, options);
  return session;
}
