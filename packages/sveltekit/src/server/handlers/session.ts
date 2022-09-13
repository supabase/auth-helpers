import type { Handle, RequestEvent } from '@sveltejs/kit';
import { decodeJwt } from 'jose';
import type { ApiError, User } from '@supabase/supabase-js';
import { getServerConfig } from '../config';
import { deleteSession, saveSession } from '../helpers';

export async function attachSession(event: RequestEvent) {
  const { supabaseClient, cookieName, tokenRefreshMargin } = getServerConfig();
  const { cookies, locals } = event;

  try {
    const accessToken = cookies.get(`${cookieName}-access-token`);

    if (!accessToken) {
      throw 'AccessTokenNotFound';
    }

    const jwt = decodeJwt(accessToken);
    if (!jwt.exp) {
      throw 'JWTPayloadFailed';
    }

    const timeNow = Math.round(Date.now() / 1000);
    if (jwt.exp < timeNow + tokenRefreshMargin) {
      const refreshToken = cookies.get(`${cookieName}-refresh-token`);
      if (!refreshToken) {
        throw 'RefreshTokenNotFound';
      }
      const { data, error } = await supabaseClient.auth.api.refreshAccessToken(
        refreshToken
      );
      if (error || !data) {
        throw error;
      }
      saveSession(cookies, data);
      locals.session = {
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
      locals.session = {
        user: { ...data, exp: jwt.exp } as User,
        accessToken: accessToken
      };
    }
  } catch (err) {
    if ((err as ApiError).message === 'Invalid Refresh Token') {
      deleteSession(cookies);
    }

    locals.session = {
      user: null,
      accessToken: null
    };
  }
}

export default function session(): Handle {
  return async ({ resolve, event }) => {
    await attachSession(event);
    return resolve(event);
  };
}
