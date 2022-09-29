import type { LoadEvent, RequestEvent } from '@sveltejs/kit';
import type { ExtendedEvent } from '../types.js';
import { getSupabase } from './getSupabase.js';

/**
 * Use this helper to authenticate load functions, actions and request-handlers
 *
 * @example
 * export const load = withAuth(({ session, supabaseClient }) => {
 *  if (!session) {
 *    throw redirect(303, '/signin');
 *  }
 *  const { data: profile } = supabaseClient
 *    .from('profiles')
 *    .select()
 *    .eq('user_id', session.user.id);
 *
 *  return { profile }
 * })
 */
export function withAuth<E extends any, T extends any>(
  cb: (event: E & ExtendedEvent) => T | Promise<T>
): (event: E) => T | Promise<T> {
  async function handle(event: E) {
    const supabaseClient = getSupabase(event as RequestEvent | LoadEvent);

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    /*
     * We are wrapping the event in a proxy to intercept the getter
     * for session and getSupabaseClient. This is necessary as sveltekit
     * does not allow overwriting the session currently.
     *
     * TODO: maybe remove this for sveltekit 1.0
     */
    const eventProxy = new Proxy(event as E & ExtendedEvent, {
      get(target, property, receiver) {
        if (property === 'supabaseClient') return supabaseClient;
        if (property === 'session') return session;
        return Reflect.get(target, property, receiver);
      }
    });

    return cb(eventProxy);
  }

  return handle;
}
