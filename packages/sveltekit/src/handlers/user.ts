import type { Handle } from '@sveltejs/kit';
import {
  type ApiError,
  COOKIE_OPTIONS,
  type CookieOptions,
  jwtDecoder,
  parseCookie
} from '../types';
import { skHelper } from '../instance';
import getUser from '../utils/getUser';

export const handleUser = (cookieOptions: CookieOptions = COOKIE_OPTIONS) => {
  const handle: Handle = async ({ event, resolve }) => {
    const req = event.request;
    const { supabaseClient } = skHelper();

    try {
      if (!req.headers.has('cookie')) {
        throw new Error('Not able to parse cookies');
      }

      const cookies = parseCookie(req.headers.get('cookie'));

      const access_token = cookies[`${cookieOptions.name}-access-token`];

      if (!access_token) {
        throw new Error('No cookie found!');
      }

      // Get payload from cached access token.
      const jwtUser = jwtDecoder(access_token);
      if (!jwtUser?.exp) {
        throw new Error('Not able to parse JWT payload!');
      }
      const timeNow = Math.round(Date.now() / 1000);
      if (jwtUser.exp < timeNow) {
        const res = await resolve(event);
        // JWT is expired, let's refresh from Gotrue
        const response = await getUser({ req, res }, cookieOptions);
        event.locals.user = response.user;
        event.locals.accessToken = response.accessToken;
        return await resolve(event);
      } else {
        // Transform JWT and add note that it is cached from JWT.
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
        event.locals.user = mergedUser;
        event.locals.accessToken = access_token;
        // set supabase auth
        supabaseClient?.auth.setAuth(access_token);
        return await resolve(event);
      }
    } catch (e) {
      const error = e as ApiError;
      event.locals.user = null;
      event.locals.error = error;
      event.locals.accessToken = null;
      return await resolve(event);
    }
  };
  return handle;
};
