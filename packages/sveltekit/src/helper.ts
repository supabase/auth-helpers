import { browser } from '$app/environment';
import { applyAction, enhance } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoadEvent, RequestEvent } from '@sveltejs/kit';
import { getClientConfig } from './config';
import { getServerConfig } from './server/config';
import type { ExtendedEvent, SupabaseSession } from './types';

export function enhanceAndInvalidate(form: HTMLFormElement) {
  return enhance(form, () => async ({ result }) => {
    await applyAction(result);
    if (result.type === 'redirect' || result.type === 'success') {
      await invalidateAll();
    }
  });
}

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

export function withAuth<E extends any, T extends any>(
  cb: (event: E & ExtendedEvent) => T | Promise<T>
): (event: E) => Promise<T> {
  async function handle(event: E) {
    let session: SupabaseSession = null;
    {
      // ServerLoad, Action, RequestHander
      const ev = event as unknown as RequestEvent;
      if (typeof ev.locals === 'object') {
        if (ev.locals.session) {
          session = {
            user: ev.locals.session.user,
            accessToken: ev.locals.session.accessToken
          };
        }
      }
    }
    {
      // Load
      const ev = event as unknown as LoadEvent;
      if (typeof ev.parent === 'function') {
        const parentData = (await ev.parent()) as App.PageData;
        if (parentData.session) {
          session = {
            user: parentData.session.user,
            accessToken: parentData.session.accessToken
          };
        }
      }
    }

    return cb({
      ...(event as any),
      session,
      getSupabaseClient() {
        return supabaseServerClient(session?.accessToken);
      }
    });
  }

  return handle;
}
