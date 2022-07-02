import type { Handle } from '@sveltejs/kit';
import {
  type ApiError,
  COOKIE_OPTIONS,
  type CookieOptions,
  parseCookie,
  jwtDecoder,
  TOKEN_REFRESH_MARGIN,
  CookieNotParsed,
  JWTPayloadFailed,
  AuthHelperError,
  AccessTokenNotFound
} from '@supabase/auth-helpers-shared';
import { skHelper } from '../instance';
import { getUser, saveTokens } from '../utils/getUser';
import log from 'loglevel';

export interface HandleUserOptions {
  cookieOptions?: CookieOptions;
  tokenRefreshMargin?: number;
}

export const handleUser = (options: HandleUserOptions = {}) => {
  const handle: Handle = async ({ event, resolve }) => {
    const req = event.request;
    const { supabaseClient } = skHelper();

    try {
      if (!req.headers.has('cookie')) {
        throw new CookieNotParsed();
      }

      const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
      const tokenRefreshMargin =
        options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;

      const cookies = parseCookie(req.headers.get('cookie'));
      const access_token = cookies[`${cookieOptions.name}-access-token`];

      if (!access_token) {
        throw new AccessTokenNotFound();
      }

      // Get payload from cached access token.
      const jwtUser = jwtDecoder(access_token);
      if (!jwtUser?.exp) {
        throw new JWTPayloadFailed();
      }
      const timeNow = Math.round(Date.now() / 1000);
      if (jwtUser.exp < timeNow + tokenRefreshMargin) {
        // JWT is expired, let's refresh from Gotrue
        const session = await getUser(req, {
          cookieOptions,
          tokenRefreshMargin
        });
        event.locals.user = session.user;
        event.locals.accessToken = session.accessToken;
        const res = await resolve(event);
        await saveTokens({ req, res }, session, {
          cookieOptions,
          tokenRefreshMargin
        });
        return res;
      } else {
        // Transform JWT and add note that it is cached from JWT.
        const user = {
          id: jwtUser.sub!,
          app_metadata: {},
          user_metadata: {},
          aud: '',
          created_at: '',
          'supabase-auth-helpers-note':
            'This user payload is retrieved from the cached JWT and might be stale. If you need up to date user data, please call the `getUser` method in a server-side context!'
        };
        type JWTUser = typeof jwtUser;
        const jwt_user: Omit<JWTUser, 'iss'> = jwtUser;
        const mergedUser = { ...user, ...jwt_user };
        event.locals.user = mergedUser;
        event.locals.accessToken = access_token;
        // set supabase auth
        supabaseClient?.auth.setAuth(access_token);
        return await resolve(event);
      }
    } catch (e) {
      if (e instanceof JWTPayloadFailed) {
        event.locals.error = e.toObj();
      } else if (e instanceof AuthHelperError) {
        log.debug(e.toObj());
      } else {
        const error = e as ApiError;
        log.debug(error.message);
      }
      event.locals.user = null;
      event.locals.accessToken = null;
      return await resolve(event);
    }
  };
  return handle;
};
