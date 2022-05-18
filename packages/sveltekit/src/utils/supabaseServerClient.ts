import type { SupabaseClient } from '@supabase/supabase-js';
import { COOKIE_OPTIONS } from 'shared';
import { skHelper } from '../instance';
import type { CookieOptions } from '../types';

/**
 * This is a helper method to wrap your SupabaseClient to inject a user's access_token to make use of RLS on the server side.
 * @param accessToken
 * @param cookieOptions
 */
function supabaseServerClient(
  accessToken: string,
  cookieOptions?: CookieOptions
): SupabaseClient;

/**
 * This is a helper method to wrap your SupabaseClient to inject a user's access_token from the request header to make use of RLS on the server side.
 * @param request
 * @param cookieOptions
 * @returns SupabaseClient
 */
function supabaseServerClient(
  request: Request,
  cookieOptions?: CookieOptions
): SupabaseClient;

/**
 * This is a helper method to wrap your SupabaseClient to inject a user's access_token to make use of RLS on the server side.
 *
 * ```js
 * import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
 *
 * export const get: RequestHandler = ({ request }) => {
 *   // Run queries with RLS on the server
 *   const { data } = await supabaseServerClient(request)
 *     .from('test')
 *     .select('*');
 *   return {
 *     body: { data }, // will be passed to the page component as props
 *   }
 * }
 * ```
 */
function supabaseServerClient(
  requestOrAccessToken: Request | string,
  cookieOptions: CookieOptions = COOKIE_OPTIONS
): SupabaseClient {
  const { supabaseClient } = skHelper();
  const access_token =
    typeof requestOrAccessToken !== 'string'
      ? requestOrAccessToken?.headers.get(`${cookieOptions.name}-access-token`)
      : requestOrAccessToken;
  if (access_token !== null) {
    supabaseClient?.auth.setAuth(access_token);
  }
  return supabaseClient!;
}

export default supabaseServerClient;
