import {
  CookieOptions,
  createServerSupabaseClient,
  parseCookies,
  serializeCookie,
  createBrowserSupabaseClient
} from '@supabase/auth-helpers-shared';
import { PKG_NAME, PKG_VERSION } from '../constants';
import { SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

/**
 * ## Authenticated Supabase client
 * ### Loader
 *
 * ```ts
 * import { createServerClient } from '@supabase/auth-helpers-remix';
 *
 * export const loader = async ({ request }: { request: Request }) => {
 *   const response = new Response();
 *
 *   const supabaseClient = createServerClient(
 *     process.env.SUPABASE_URL,
 *     process.env.SUPABASE_ANON_KEY,
 *     { request, response }
 *   );
 *
 *   const { data } = await supabaseClient.from('test').select('*');
 *
 *   return json(
 *    { data },
 *    { headers: response.headers }
 *   );
 * };
 * ```
 *
 * ### Action
 *
 * ```ts
 * import { createServerClient } from '@supabase/auth-helpers-remix';
 *
 * export const action = async ({ request }: { request: Request }) => {
 *   const response = new Response();
 *
 *   const supabaseClient = createServerClient(
 *     process.env.SUPABASE_URL,
 *     process.env.SUPABASE_ANON_KEY,
 *     { request, response }
 *   );
 *
 *   const { data } = await supabaseClient.from('test').select('*');
 *
 *   return json(
 *    { data },
 *    { headers: response.headers }
 *   );
 * };
 * ```
 *
 * ### Component
 *
 * ```ts
 * import { createBrowserClient } from '@supabase/auth-helpers-remix';
 *
 * useEffect(() => {
 *   const supabaseClient = createBrowserClient(
 *     window.env.SUPABASE_URL,
 *     window.env.SUPABASE_ANON_KEY
 *   );
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
 *
 * Note: window.env is not automatically populated by Remix
 * Check out the [example app](../../../../examples/remix/app/root.tsx) or
 * [Remix docs](https://remix.run/docs/en/v1/guides/envvars#browser-environment-variables) for more info
 */

export function createBrowserClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>(
  supabaseUrl: string,
  supabaseKey: string,
  {
    options,
    cookieOptions
  }: {
    options?: Omit<SupabaseClientOptions<SchemaName>, 'auth'>;
    cookieOptions?: CookieOptions;
  } = {}
): SupabaseClient<Database, SchemaName> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'supabaseUrl and supabaseKey are required to create a Supabase client! Find these under `Settings` > `API` in your Supabase dashboard.'
    );
  }

  return createBrowserSupabaseClient<Database, SchemaName>({
    supabaseUrl,
    supabaseKey,
    options: {
      ...options,
      global: {
        ...options?.global,
        headers: {
          ...options?.global?.headers,
          'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
        }
      }
    },
    cookieOptions
  });
}

export function createServerClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>(
  supabaseUrl: string,
  supabaseKey: string,
  {
    request,
    response,
    options,
    cookieOptions
  }: {
    request: Request;
    response: Response;
    options?: Omit<SupabaseClientOptions<SchemaName>, 'auth'>;
    cookieOptions?: CookieOptions;
  }
): SupabaseClient<Database, SchemaName> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'supabaseUrl and supabaseKey are required to create a Supabase client! Find these under `Settings` > `API` in your Supabase dashboard.'
    );
  }

  if (!request || !response) {
    throw new Error(
      'request and response must be passed to createSupabaseClient function, when called from loader or action'
    );
  }

  return createServerSupabaseClient<Database, SchemaName>({
    supabaseUrl,
    supabaseKey,
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
      ...options,
      global: {
        ...options?.global,
        headers: {
          ...options?.global?.headers,
          'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
        }
      }
    },
    cookieOptions
  });
}
