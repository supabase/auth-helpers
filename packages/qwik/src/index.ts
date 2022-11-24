export type { Session, User, SupabaseClient } from '@supabase/supabase-js';

import {
  CookieOptions,
  createBrowserSupabaseClient as _createBrowserSupabaseClient,
  createServerSupabaseClient as _createServerSupabaseClient,
  parseCookies,
  serializeCookie
} from '@supabase/auth-helpers-shared';

export function createBrowserSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>(supabaseUrl, supabaseKey,{
  cookieOptions
}: {
  cookieOptions?: CookieOptions;
} = {}) {
  return _createBrowserSupabaseClient<Database, SchemaName>({
    supabaseUrl,
    supabaseKey,
    cookieOptions
  });
}

export function createServerSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>(supabaseUrl, supabaseKey,
  context:
    { req: { params: any, headers: any }, res: { headers: any }},
  {
    cookieOptions
  }: {
    cookieOptions?: CookieOptions;
  } = {}
) {
  return _createServerSupabaseClient<Database, SchemaName>({
    supabaseUrl,
    supabaseKey,
    getCookie(name) {
      const cookie = context.req.headers.get('cookie');
      const parsed = parseCookies(cookie);
      return parsed[name];
    },
    setCookie(name, value, options) {
      const newSessionStr = serializeCookie(name, value, {
        ...options,
        // Allow supabase-js on the client to read the cookie as well
        httpOnly: false
      });

      context.req.headers.append('cookie', newSessionStr);
      context.res.headers.set('set-cookie', newSessionStr);
    },
    getRequestHeader: (key) => {
      return context.req.headers.get(key)
    },
    getResponseHeader: (key) => {
      const header = context.res.getHeader(key);
      if (typeof header === 'number') {
        return String(header);
      }

      return header;
    },
    setHeader: (key, value) => context.res.setHeader(key, value),
    cookieOptions
  });
}
