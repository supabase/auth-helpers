import type { Handle, RequestEvent } from '@sveltejs/kit';
import type { ApiError, User } from '@supabase/supabase-js';
import {
  AccessTokenNotFound,
  AuthHelperError,
  jwtDecoder,
  JWTPayloadFailed,
  RefreshTokenNotFound
} from '@supabase/auth-helpers-shared';
import { getConfig } from '../../config';
import { deleteSession, saveSession } from '../utils/cookies';
import type { SupabaseSession } from '../../types';
import logger from '../utils/log';

/**
 * Get the session from a request event
 *
 * @example
 * export async function handle({ event, resolve }) {
 *  event.locals.session = await getSupabaseSession(event);
 *  return resolve(event);
 * }
 */
export async function getSupabaseSession(event: RequestEvent) {
  const {
    supabaseClient,
    cookieOptions: { name: cookieName },
    tokenRefreshMargin
  } = getConfig();
  const { cookies } = event;

  let session: SupabaseSession = {};

  try {
    const accessToken = cookies.get(`${cookieName}-access-token`);

    if (!accessToken) {
      throw new AccessTokenNotFound();
    }

    const jwt = jwtDecoder(accessToken);
    if (!jwt.exp) {
      throw new JWTPayloadFailed();
    }

    const timeNow = Math.round(Date.now() / 1000);
    if (jwt.exp < timeNow + tokenRefreshMargin) {
      const refreshToken = cookies.get(`${cookieName}-refresh-token`);
      if (!refreshToken) {
        throw new RefreshTokenNotFound();
      }
      const { data, error } = await supabaseClient.auth.api.refreshAccessToken(
        refreshToken
      );
      if (error || !data) {
        throw error;
      }
      saveSession(cookies, data);
      session = {
        user: { ...data.user, exp: data.expires_at } as User,
        accessToken: data.access_token
      };
    } else {
      const { data, error } = await supabaseClient.auth.api.getUser(
        accessToken
      );
      if (error || !data) {
        throw error;
      }
      session = {
        user: { ...data, exp: jwt.exp } as User,
        accessToken: accessToken
      };
    }
  } catch (err) {
    if (err instanceof JWTPayloadFailed) {
      logger.info('JWTPayloadFailed error has happened!');
      session.error = err.toObj();
    } else if (err instanceof AuthHelperError) {
      // do nothing, these are all just to disrupt the control flow
    } else {
      const error = err as ApiError;
      logger.error(error.message);
      if (error.message === 'Invalid Refresh Token') {
        deleteSession(cookies);
      }
    }
  }
  return session;
}

/**
 * Reads the cookies and populates the session to `event.locals`.
 *
 * A shorthand for `getSupabaseSession`.
 * @example
 * // src/hooks.server.ts
 * export const handle = session();
 * export const handle = sequence(session(), ...);
 */
export function session(): Handle {
  const { setSessionToLocals } = getConfig();

  return async ({ resolve, event }) => {
    const session = await getSupabaseSession(event);
    setSessionToLocals(event.locals, session);
    return resolve(event);
  };
}
