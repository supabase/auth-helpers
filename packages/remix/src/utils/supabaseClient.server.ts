import { supabaseClient, SupabaseClient } from './initSupabase.server';
import { CookieOptions } from '@supabase/auth-helpers-shared';
import { getSession } from './cookies';

/**
 * This is a helper method to wrap your SupabaseClient to inject a user's access_token to make use of RLS on the server side.
 *
 * ```js
 * import { supabaseServerClient } from '@supabase/auth-helpers-nextjs';
 *
 * export async function getServerSideProps(context) {
 *   // Run queries with RLS on the server
 *   const { data } = await supabaseServerClient(context)
 *     .from('test')
 *     .select('*');
 *   return {
 *     props: { data }, // will be passed to the page component as props
 *   }
 * }
 * ```
 *
 * @param supabaseClient
 * @param context
 * @param cookieOptions
 * @returns supabaseClient
 *
 * @category Server
 */

export default async function supabaseServerClient(
  context: { request: Request },
  cookieOptions: CookieOptions = {
    name: 'sb'
  }
): Promise<SupabaseClient> {
  if (!context.request.headers.get('Cookie')) {
    return supabaseClient;
  }

  const session = await getSession(context.request.headers.get('Cookie'));
  const access_token = session.get('accessToken');

  supabaseClient.auth.setAuth(access_token);
  return supabaseClient;
}
