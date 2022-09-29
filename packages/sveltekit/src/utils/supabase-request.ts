import { getConfig } from '../config';
import { createServerSupabaseClient } from '@supabase/auth-helpers-shared';
import type { RequestEvent } from '@sveltejs/kit';
import { PKG_NAME, PKG_VERSION } from '../constants';

const CACHE_KEY = Symbol('supabase-client');

export function createRequestSupabaseClient(event: RequestEvent) {
  const { cookies, request } = event;
  const locals = event.locals as any;

  if (locals[CACHE_KEY]) {
    return locals[CACHE_KEY];
  }

  const { supabaseUrl, supabaseKey, options, cookieOptions } = getConfig();

  const client = createServerSupabaseClient<
    App.Supabase['Database'],
    App.Supabase['SchemaName']
  >({
    supabaseUrl,
    supabaseKey,
    getCookie(name) {
      return cookies.get(name);
    },
    setCookie(name, value, options) {
      cookies.set(name, value, options);
    },
    getRequestHeader(name) {
      return request.headers.get(name) ?? undefined;
    },
    options: {
      ...options,
      global: {
        ...options.global,
        headers: {
          ...options.global?.headers,
          'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
        }
      }
    },
    cookieOptions
  });

  locals[CACHE_KEY] = client;

  return client;
}
