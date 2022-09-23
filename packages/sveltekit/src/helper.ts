import { browser } from '$app/environment';
import { applyAction, enhance } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoadEvent, RequestEvent } from '@sveltejs/kit';
import { getClientConfig } from './config';
import { getServerConfig } from './server/config';
import type { ExtendedEvent, SupabaseSession } from './types';

/**
 * The default enhance behaviour but it also calls invalidate on success or redirect
 */
export function enhanceAndInvalidate(form: HTMLFormElement) {
  return enhance(form, () => async ({ result }) => {
    await applyAction(result);
    if (result.type === 'redirect' || result.type === 'success') {
      await invalidateAll();
    }
  });
}

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
  const { supabaseClient } = browser ? getClientConfig() : getServerConfig();
  if (!access_token) {
    throw new Error(
      'No access token provided, make sure to check if the user is authenticated.'
    );
  }
  supabaseClient.auth.setAuth(access_token);
  return supabaseClient;
}

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
    let session: SupabaseSession = null;

    // ServerLoad, Action, RequestHander
    const requestEvent = event as unknown as RequestEvent;
    if (typeof requestEvent.locals === 'object') {
      session = getServerConfig().getSessionFromLocals(requestEvent.locals);
    }

    // Load
    const loadEvent = event as unknown as LoadEvent;
    if (typeof loadEvent.parent === 'function') {
      const parentData = (await loadEvent.parent()) as App.PageData;
      session = getClientConfig().getSessionFromPageData(parentData);
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
          return () => supabaseServerClient(session?.accessToken);
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
