import type { Session } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';
import { getServerConfig } from './config';

export function saveSession(cookies: Cookies, session: Session) {
  const { cookieName, cookieOptions } = getServerConfig();

  if (session.access_token) {
    cookies.set(
      `${cookieName}-access-token`,
      session.access_token,
      cookieOptions
    );
  }
  if (session.refresh_token) {
    cookies.set(
      `${cookieName}-refresh-token`,
      session.refresh_token,
      cookieOptions
    );
  }
  if (session.provider_token) {
    cookies.set(
      `${cookieName}-provider-token`,
      session.provider_token,
      cookieOptions
    );
  }
}

export function deleteSession(cookies: Cookies) {
  const { cookieName, cookieOptions } = getServerConfig();

  ['access', 'refresh', 'provider'].forEach((name) => {
    cookies.set(`${cookieName}-${name}-token`, '', {
      ...cookieOptions,
      maxAge: -1
    });
  });
}

export function getProviderToken(cookies: Cookies) {
  const { cookieName } = getServerConfig();
  return cookies.get(`${cookieName}-provider-token`);
}
