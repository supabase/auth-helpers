import { applyAction, enhance } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  error,
  redirect,
  type LoadEvent,
  type RequestEvent
} from '@sveltejs/kit';
import { getClientConfig } from './config';
import type { AuthenticatedSupabaseSession, ExtendedEvent } from './types';

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
  const { supabaseClient } = getClientConfig();
  // no need to set the token on the browser
  if (access_token) {
    supabaseClient?.auth.setAuth(access_token);
  }
  return supabaseClient;
}

type NotAuthenticated =
  | { status: number; location: string; error?: never }
  | { status: number; location?: never; error: App.PageError };

function handleNotAuthenticated({
  status,
  location,
  error: errorBody
}: NotAuthenticated) {
  if (location) {
    throw redirect(status, location);
  }
  if (errorBody) {
    throw error(status, errorBody);
  }
  throw new Error('You must provide one of [location, error]');
}

export function withAuth<T extends (event: any) => any>(
  options: NotAuthenticated,
  cb: (event: Parameters<T>[0] & ExtendedEvent) => ReturnType<T>
): T {
  async function handle(event: Parameters<T>[0]) {
    let session!: AuthenticatedSupabaseSession;
    {
      // ServerLoad, Action, RequestHander
      const ev = event as RequestEvent;
      if (typeof ev.locals === 'object') {
        if (!ev.locals.session.user) {
          return handleNotAuthenticated(options);
        }
        session = {
          user: ev.locals.session.user,
          accessToken: ev.locals.session.accessToken
        };
      }
    }
    {
      // Load
      const ev = event as LoadEvent;
      if (typeof ev.parent === 'function') {
        const parentData = (await ev.parent()) as App.PageData;
        if (!parentData.session.user) {
          return handleNotAuthenticated(options);
        }
        session = {
          user: parentData.session.user,
          accessToken: parentData.session.accessToken
        };
      }
    }

    if (!session) {
      throw new Error('Can not get the session');
    }

    return cb({
      ...event,
      session,
      getSupabaseClient() {
        return supabaseServerClient(session.accessToken);
      }
    });
  }

  return handle as unknown as T;
}
