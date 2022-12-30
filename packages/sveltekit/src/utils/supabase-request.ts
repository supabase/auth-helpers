import { getConfig } from '../config';
import { createServerSupabaseClient } from '@supabase/auth-helpers-shared';
import type { RequestEvent } from '@sveltejs/kit';
import type { TypedSupabaseClient } from '../types';

const CACHE_KEY = Symbol('supabase-client');

export function getRequestSupabaseClient(
  event: RequestEvent
): TypedSupabaseClient {
  const { cookies, request } = event;
  const locals = event.locals as any;

  if (locals[CACHE_KEY]) {
    return locals[CACHE_KEY];
  }

  const { supabaseUrl, supabaseKey, options, cookieOptions } = getConfig();

  const client = createServerSupabaseClient({
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
        // Inject the event fetch function as default, but allow overriding
        fetch: event.fetch,
        ...options.global,
      }
    },
    cookieOptions
  });

  locals[CACHE_KEY] = client;

  return client;
}
