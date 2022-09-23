import type { SupabaseClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';
import { getConfig } from '../config';

/**
 * Use this helper to get the global supabaseClient
 * configured to send the accessToken on every request
 *
 * **Always use the returned instance directly**
 *
 * _GOOD_:
 * ```ts
 * await supabaseServerClient(accessToken).from('posts').select();
 * ```
 *
 * _BAD_:
 * ```ts
 * const supabaseClient = supabaseServerClient(accessToken)
 * await supabaseClient.from('posts').select();
 * ```
 */
export function supabaseServerClient(
  access_token: string | null | undefined
): SupabaseClient {
  const { supabaseClient } = getConfig();
  if (!access_token) {
    throw new Error(
      'No access token provided, make sure to check if the user is authenticated.'
    );
  }
  supabaseClient.auth.setAuth(access_token);
  return supabaseClient;
}
