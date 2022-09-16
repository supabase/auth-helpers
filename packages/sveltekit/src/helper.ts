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
        session = getServerConfig().getSessionFromLocals(ev.locals);
      }
    }
    {
      // Load
      const ev = event as unknown as LoadEvent;
      if (typeof ev.parent === 'function') {
        const parentData = (await ev.parent()) as App.PageData;
        session = getClientConfig().getSessionFromPageData(parentData);
      }
    }

    const ev = new Proxy(event as E & ExtendedEvent, {
      get(target, p, receiver) {
        if (p === 'getSupabaseClient')
          return () => supabaseServerClient(session?.accessToken);
        if (p === 'session') {
          return session;
        }
        return Reflect.get(target, p, receiver);
      }
    });

    return cb(ev);
  }

  return handle;
}
