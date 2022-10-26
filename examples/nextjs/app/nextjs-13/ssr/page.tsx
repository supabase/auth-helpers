// Next.js 13 SSR
// NOTE: This is experimental and used as research to understand how to support Next.js 13 in the future.

import { cookies, headers } from 'next/headers';
import {
  CookieOptions,
  createBrowserSupabaseClient as _createBrowserSupabaseClient,
  createServerSupabaseClient as _createServerSupabaseClient,
  ensureArray,
  filterCookies,
  serializeCookie
} from '@supabase/auth-helpers-shared';

function createServerSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  cookieOptions
}: {
  cookieOptions?: CookieOptions;
} = {}) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables are required!'
    );
  }

  return _createServerSupabaseClient<Database, SchemaName>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    getRequestHeader: (key) => headers().get(key) ?? undefined,

    getCookie(name) {
      return cookies().get(name);
    },
    setCookie(name, value, options) {
      // TODO: figure out how to access response object
      // const newSetCookies = filterCookies(
      //   ensureArray(context.res.getHeader('set-cookie')?.toString() ?? []),
      //   name
      // );
      // const newSessionStr = serializeCookie(name, value, {
      //   ...options,
      //   // Allow supabase-js on the client to read the cookie as well
      //   httpOnly: false
      // });
      // context.res.setHeader('set-cookie', [...newSetCookies, newSessionStr]);
    },
    options: {
      global: {
        // fetch // TODO: is this needed?
      }
    },
    cookieOptions
  });
}

// https://beta.nextjs.org/docs/data-fetching/fetching#segment-cache-configuration
export const cache = 'no-store';

async function getData() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data } = await supabase.from('users').select('*');

  return { user, data };
}

export default async function Page() {
  const data = await getData();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
