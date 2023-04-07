import {
  CookieOptions,
  createBrowserSupabaseClient as _createBrowserSupabaseClient,
  createServerSupabaseClient as _createServerSupabaseClient,
  ensureArray,
  filterCookies,
  serializeCookie,
  parseCookies,
  SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse
} from 'next';
import { NextRequest, NextResponse } from 'next/server';

// Types
export type { Session, User, SupabaseClient } from '@supabase/supabase-js';

// Methods
export function createBrowserSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  options,
  cookieOptions
}: {
  supabaseUrl?: string;
  supabaseKey?: string;
  options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
  cookieOptions?: CookieOptions;
} = {}) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
    );
  }

  return _createBrowserSupabaseClient<Database, SchemaName>({
    supabaseUrl,
    supabaseKey,
    options: {
      ...options,
      global: {
        ...options?.global,
        headers: {
          ...options?.global?.headers,
          'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
        }
      }
    },
    cookieOptions
  });
}

export function createServerSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>(
  context:
    | GetServerSidePropsContext
    | { req: NextApiRequest; res: NextApiResponse },
  {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options,
    cookieOptions
  }: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptions;
  } = {}
) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
    );
  }

  return _createServerSupabaseClient<Database, SchemaName>({
    supabaseUrl,
    supabaseKey,
    getRequestHeader: (key) => context.req.headers[key],

    getCookie(name) {
      return context.req.cookies[name];
    },
    setCookie(name, value, options) {
      const newSetCookies = filterCookies(
        ensureArray(context.res.getHeader('set-cookie')?.toString() ?? []),
        name
      );
      const newSessionStr = serializeCookie(name, value, {
        ...options,
        // Allow supabase-js on the client to read the cookie as well
        httpOnly: false
      });

      context.res.setHeader('set-cookie', [...newSetCookies, newSessionStr]);
    },
    options: {
      ...options,
      global: {
        ...options?.global,
        headers: {
          ...options?.global?.headers,
          'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
        }
      }
    },
    cookieOptions
  });
}

export function createMiddlewareSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>(
  context: { req: NextRequest; res: NextResponse },
  {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options,
    cookieOptions
  }: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptions;
  } = {}
) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
    );
  }

  return _createServerSupabaseClient<Database, SchemaName>({
    supabaseUrl,
    supabaseKey,
    getCookie(name) {
      const cookies = parseCookies(context.req.headers.get('cookie') ?? '');
      return cookies[name];
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
      const header = context.req.headers.get(key) ?? undefined;
      return header;
    },
    options: {
      ...options,
      global: {
        ...options?.global,
        headers: {
          ...options?.global?.headers,
          'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
        }
      }
    },
    cookieOptions
  });
}

export function createServerComponentSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  headers,
  cookies,
  options,
  cookieOptions
}: {
  supabaseUrl?: string;
  supabaseKey?: string;
  headers: () => any; // TODO update this to be ReadonlyRequestCookies when we upgrade to Next.js 13
  cookies: () => any; // TODO update this to be ReadonlyHeaders when we upgrade to Next.js 13
  options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
  cookieOptions?: CookieOptions;
}) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
    );
  }

  return _createServerSupabaseClient<Database, SchemaName>({
    supabaseUrl,
    supabaseKey,
    getRequestHeader: (key) => {
      const headerList = headers();
      return headerList.get(key);
    },
    getCookie(name) {
      const nextCookies = cookies();
      return nextCookies.get(name)?.value;
    },
    setCookie() {
      // Note: The Next.js team at Vercel is working on adding the ability to
      // set cookies in addition to the cookies function.
      // https://beta.nextjs.org/docs/api-reference/cookies
    },
    options: {
      ...options,
      global: {
        ...options?.global,
        headers: {
          'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
        }
      }
    },
    cookieOptions
  });
}

export const createRouteHandlerSupabaseClient =
  createServerComponentSupabaseClient;
