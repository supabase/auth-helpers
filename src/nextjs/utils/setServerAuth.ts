import { GetServerSidePropsContext, NextApiRequest } from 'next';
import { SupabaseClient } from '@supabase/supabase-js';
import { CookieOptions } from '../types';

/**
 * This is a helper method to wrap your SupabaseClient to inject a user's access_token to make use of RLS on the server side.
 *
 * ```js
 * import { setServerAuth } from '@supabase/supabase-auth-helpers/nextjs';
 * import { createClient } from '@supabase/supabase-js';
 *
 * const supabaseClient = createClient(
 *   process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 * );
 *
 * export async function getServerSideProps(context) {
 *   // Run queries with RLS on the server
 *   const { data } = await setServerAuth(supabaseClient, context)
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

export default function setServerAuth(
  supabaseClient: SupabaseClient,
  context: GetServerSidePropsContext | { req: NextApiRequest },
  cookieOptions: CookieOptions = {
    name: 'sb'
  }
): SupabaseClient {
  if (!context.req.cookies) {
    return supabaseClient;
  }
  const access_token =
    context.req.cookies[`${cookieOptions.name}-access-token`];
  supabaseClient.auth.setAuth(access_token);
  return supabaseClient;
}
