import { applyAction, enhance } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { redirect, type LoadEvent } from '@sveltejs/kit';
import { getClientConfig } from './config';

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

export function loadWithSession<T>(
  { status, location }: { status: number; location: string },
  cb?: (event: LoadEvent & { session: Required<App.SupabaseSession> }) => T
) {
  return (event: LoadEvent) =>
    event.parent().then((data) => {
      if (!data.session.user) {
        throw redirect(status, location);
      }
      if (!cb) {
        return;
      }
      return cb({ ...event, session: data.session });
    });
}
