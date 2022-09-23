import type { Handle, RequestEvent } from '@sveltejs/kit';
import type { ApiError, User } from '@supabase/supabase-js';
import {
  AccessTokenNotFound,
  jwtDecoder,
  JWTPayloadFailed,
  RefreshTokenNotFound
} from '@supabase/auth-helpers-shared';
import { getServerConfig } from '../config';
import { deleteSession, saveSession } from '../helpers';
import type { SupabaseSession } from '../../types';

export async function getSupabaseSession(event: RequestEvent) {
  const {
    supabaseClient,
    cookieOptions: { name: cookieName },
    tokenRefreshMargin
  } = getServerConfig();
  const { cookies } = event;

  let session: SupabaseSession = null;

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
    if ((err as ApiError).message === 'Invalid Refresh Token') {
      deleteSession(cookies);
    }
  }
  return session;
}

export function session(): Handle {
  const { setSessionToLocals } = getServerConfig();

  return async ({ resolve, event }) => {
    const session = await getSupabaseSession(event);
    setSessionToLocals(event.locals, session);
    return resolve(event);
  };
}
