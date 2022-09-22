import type { Handle, RequestEvent } from '@sveltejs/kit';
import type { ApiError, User } from '@supabase/supabase-js';
import { getServerConfig } from '../config';
import { deleteSession, saveSession } from '../helpers';
import type { JWTPayload, SupabaseSession } from '../../types';

function decodeJwt(jwt: string): JWTPayload {
  const payloadBase64Encoded = jwt.split('.')[1];

  try {
    const payloadBase64Decoded = Buffer.from(
      payloadBase64Encoded,
      'base64'
    ).toString('utf-8');

    const payload = JSON.parse(payloadBase64Decoded);

    return payload;
  } catch (err) {
    throw 'InvalidJWT';
  }
}

export async function getSupabaseSession(event: RequestEvent) {
  const { supabaseClient, cookieName, tokenRefreshMargin } = getServerConfig();
  const { cookies } = event;

  let session: SupabaseSession = null;

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
