import {
  CookieOptions,
  createServerSupabaseClient,
  parseCookies,
  serializeCookie,
  createBrowserSupabaseClient
} from '@supabase/auth-helpers-shared';
import { PKG_NAME, PKG_VERSION } from '../constants';
import { SupabaseClient } from '../';

/**
 * ## Isomorphic Authenticated Supabase Queries
 * ### Server
 *
 * ```ts
 * import { getSupabase } from '@supabase/auth-helpers-remix';
 *
 * export const loader = async ({ request }: { request: Request }) => {
 *   const response = new Response();
 *   const supabaseClient = getSupabase({ request, response });
 *   const { data } = await supabaseClient.from('test').select('*');
 *
 *   return json(
 *    { data },
 *    { headers: response.headers }
 *   );
 * };
 * ```
 *
 * ### Client
 *
 * ```ts
 * import { getSupabase } from '@supabase/auth-helpers-remix';
 *
 * useEffect(() => {
 *   const supabaseClient = getSupabase();
 *
 *   const getData = async () => {
 *     const { data: supabaseData } = await supabaseClient
 *       .from('test')
 *       .select('*');
 *
 *     console.log({ data });
 *   };
 *
 *   getData();
 * }, []);
 * ```
 */

declare global {
  interface Window {
    env: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}

export function getBrowserClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({ cookieOptions }: { cookieOptions: CookieOptions }) {
  const isSSR = typeof document === 'undefined';

  if (isSSR) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY env variables are required!'
      );
    }
    return createBrowserSupabaseClient<Database, SchemaName>({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      cookieOptions
    });
  }

  if (!window.env.SUPABASE_URL || !window.env.SUPABASE_ANON_KEY) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_ANON_KEY env variables are required on the window!'
    );
  }

  return createBrowserSupabaseClient<Database, SchemaName>({
    supabaseUrl: window.env.SUPABASE_URL,
    supabaseKey: window.env.SUPABASE_ANON_KEY,
    cookieOptions
  });
}

export function getServerClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  request,
  response,
  cookieOptions
}: {
  request: Request;
  response: Response;
  cookieOptions: CookieOptions;
}) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_ANON_KEY env variables are required!'
    );
  }

  return createServerSupabaseClient<Database, SchemaName>({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
    getRequestHeader: (key) => {
      return request.headers.get(key) ?? undefined;
    },
    getCookie: (name) => {
      return parseCookies(request?.headers?.get('Cookie') ?? '')[name];
    },
    setCookie(name, value, options) {
      const cookieStr = serializeCookie(name, value, {
        ...options,
        // Allow supabase-js on the client to read the cookie as well
        httpOnly: false
      });
      response.headers.set('set-cookie', cookieStr);
    },
    options: {
      global: {
        headers: {
          'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
        }
      }
    },
    cookieOptions
  });
}

export default function getSupabase<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  request,
  response,
  cookieOptions = {}
}: {
  request?: Request;
  response?: Response;
  cookieOptions?: CookieOptions;
} = {}): SupabaseClient<Database, SchemaName> {
  if (!request && !response) {
    return getBrowserClient<Database, SchemaName>({ cookieOptions });
  }

  if (!request || !response) {
    throw new Error(
      'request and response must be passed to getSupabase function'
    );
  }

  return getServerClient<Database, SchemaName>({
    request,
    response,
    cookieOptions
  });
}
