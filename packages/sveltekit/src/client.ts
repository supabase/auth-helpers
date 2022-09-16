import { browser } from '$app/environment';
import { invalidateAll } from '$app/navigation';
import { page } from '$app/stores';
import type {
  AuthChangeEvent,
  SupabaseClient,
  User
} from '@supabase/supabase-js';
import { onMount } from 'svelte';
import { setClientConfig, getClientConfig } from './config';
import { ENDPOINT_PREFIX, TOKEN_REFRESH_MARGIN } from './constants';

interface Options {
  supabaseClient: SupabaseClient;
  tokenRefreshMargin?: number;
  endpointPrefix?: string;
}

const HANDLE_EVENTS: AuthChangeEvent[] = ['SIGNED_IN', 'SIGNED_OUT'];

export function setupSupabase({
  supabaseClient,
  tokenRefreshMargin = TOKEN_REFRESH_MARGIN,
  endpointPrefix = ENDPOINT_PREFIX
}: Options) {
  setClientConfig({ supabaseClient, tokenRefreshMargin, endpointPrefix });
}

export function startSupabaseSessionSync() {
  if (!browser) {
    return;
  }
  const { supabaseClient, tokenRefreshMargin } = getClientConfig();

  onMount(() => {
    let timeout: ReturnType<typeof setTimeout> | null;
    let expiresAt: number | undefined;

    const resetTimout = () => {
      timeout && clearTimeout(timeout);
      timeout = null;
    };

    const pageUnsub = page.subscribe(({ data }) => {
      if (!data.session) {
        resetTimout();
        // @ts-expect-error this is a private method but we have to clear the session
        supabaseClient.auth._removeSession();
        return;
      }

      supabaseClient.auth.setAuth(data.session.accessToken);

      const exp = (data.session.user as User & { exp: number })?.exp;
      if (!exp) {
        resetTimout();
        return;
      }

      if (exp !== expiresAt) {
        expiresAt = exp;

        const timeNow = Math.round(Date.now() / 1000);
        const expiresIn = expiresAt - timeNow;
        const refreshDurationBeforeExpires =
          expiresIn > tokenRefreshMargin ? tokenRefreshMargin : 0.5;

        resetTimout();

        timeout = setTimeout(() => {
          // refresh token
          invalidateAll();
        }, (expiresIn - refreshDurationBeforeExpires) * 1000);
      }
    });

    const { data: subscription } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (HANDLE_EVENTS.indexOf(event) === -1) return;

        fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, session }),
          credentials: 'same-origin'
        }).then((response) => {
          if (response.ok) {
            invalidateAll();
          }
        });
      }
    );

    return () => {
      timeout && clearTimeout(timeout);
      pageUnsub();
      subscription?.unsubscribe();
    };
  });
}
