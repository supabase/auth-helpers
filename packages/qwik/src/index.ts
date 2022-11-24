import type { SupabaseClient } from '@supabase/supabase-js'
import {
  CookieOptions,
  createBrowserSupabaseClient as _createBrowserSupabaseClient,
  createServerSupabaseClient as _createServerSupabaseClient
} from '@supabase/auth-helpers-shared';

import { useContext, QRL } from '@builder.io/qwik'
import { RequestEvent } from '@builder.io/qwik-city'
import { SupabaseContext } from './components/SupabaseProvider'

export type { Session, User, SupabaseClient } from '@supabase/supabase-js';

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
  event: RequestEvent,
  {
    cookieOptions
  }: {
    cookieOptions?: CookieOptions;
  } = {}
) {
  return _createServerSupabaseClient<Database, SchemaName>({
    supabaseUrl,
    supabaseKey,
    getRequestHeader: (key) => {
      return event.request.headers.get(key);
    },
    getResponseHeader: (key) => {
      const header = event.response.headers.get(key);
      if (typeof header === 'number') {
        return String(header);
      }

      return header;
    },
    setHeader: (key, value: string) => event.response.headers.set(key, value),
    cookieOptions
  });
}

export type QRLSupaBaseAuth = QRL<() => Promise<SupabaseClient['auth']>>
export type QRLSupaBase = QRL<() => SupabaseClient>

export function useSupabase(): QRLSupaBase {
  const ctx = useContext(SupabaseContext)

  if (!ctx) {
    throw new Error(
      'useSupabase must be used within a component tree that calls useContextProvider'
    )
  }

  return ctx
}