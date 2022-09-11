import type { Session } from '@supabase/supabase-js';
import {
  error,
  redirect,
  type Cookies,
  type RequestEvent,
  type ServerLoadEvent
} from '@sveltejs/kit';
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

export function serverLoadWithSession<T>(
  { status, location }: { status: number; location: string },
  cb?: (
    event: ServerLoadEvent & { session: Required<App.SupabaseSession> }
  ) => T
) {
  return (event: ServerLoadEvent) => {
    if (!event.locals.user) {
      throw redirect(status, location);
    }
    if (!cb) {
      return;
    }
    const session = {
      user: event.locals.user,
      accessToken: event.locals.accessToken
    };
    return cb({ ...event, session });
  };
}

export function serverWithSession<T>(
  {
    status,
    location,
    error: errorBody
  }: { status: number; location?: string; error?: App.PageError },
  cb: (event: RequestEvent & { session: Required<App.SupabaseSession> }) => T
) {
  return (event: RequestEvent) => {
    if (!event.locals.user) {
      if (location) {
        throw redirect(status, location);
      }
      throw error(status, errorBody);
    }
    const session = {
      user: event.locals.user,
      accessToken: event.locals.accessToken
    };
    return cb({ ...event, session });
  };
}
