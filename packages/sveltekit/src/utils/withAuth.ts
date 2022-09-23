import type { LoadEvent, RequestEvent } from '@sveltejs/kit';
import { getConfig } from '../config';
import type { ExtendedEvent, SupabaseSession } from '../types';
import { supabaseServerClient } from './supabaseServerClient';

/**
 * Use this helper to authenticate load functions, actions and request-handlers
 *
 * @example
 * export const load = withAuth(({ session, getSupabaseClient }) => {
 *  if (!session) {
 *    throw redirect(303, '/signin');
 *  }
 *  const { data: profile } = getSupabaseClient()
 *    .from('profiles')
 *    .select()
 *    .eq('user_id', session.user.id);
 *
 *  return { profile }
 * })
 */
export function withAuth<E extends any, T extends any>(
  cb: (event: E & ExtendedEvent) => T | Promise<T>
): (event: E) => Promise<T> {
  async function handle(event: E) {
    let session: SupabaseSession = {};

    // ServerLoad, Action, RequestHander
    const requestEvent = event as unknown as RequestEvent;
    if (typeof requestEvent.locals === 'object') {
      session = getConfig().getSessionFromLocals(requestEvent.locals);
    }

    // Load
    const loadEvent = event as unknown as LoadEvent;
    if (typeof loadEvent.parent === 'function') {
      const parentData = (await loadEvent.parent()) as App.PageData;
      session = getConfig().getSessionFromPageData(parentData);
    }

    /*
     * We are wrapping the event in a proxy to intercept the getter
     * for session and getSupabaseClient. This is necessary as sveltekit
     * does not allow overwriting the session currently.
     *
     * TODO: maybe remove this for sveltekit 1.0
     */
    const eventProxy = new Proxy(event as E & ExtendedEvent, {
      get(target, property, receiver) {
        if (property === 'getSupabaseClient')
          return () => supabaseServerClient(session.accessToken);
        if (property === 'session') {
          return session;
        }
        return Reflect.get(target, property, receiver);
      }
    });

    return cb(eventProxy);
  }

  return handle;
}
