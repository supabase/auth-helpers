<script lang="ts">
  import type { SupabaseClient, User } from '@supabase/supabase-js';
  import { onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { checkSession, type Session } from './helpers';
  import { setIsLoading, setError, user, accessToken } from './store';
  import { dequal } from 'dequal';
  import { CallbackUrlFailed } from '@supabase/auth-helpers-shared';

  // Props
  export let supabaseClient: SupabaseClient;
  export let endpointPrefix = '/api/auth';
  export let callbackUrl = `${endpointPrefix}/callback`;
  export let profileUrl = `${endpointPrefix}/user`;
  export let autoRefreshToken = true;
  export let session: Writable<Session>;
  export let onUserUpdate = (user: User | null) => {};

  const handleVisibilityChange = async () => {
    if (document?.visibilityState === 'visible') {
      setIsLoading(true);
      await checkSession({ profileUrl, autoRefreshToken, supabaseClient });
      setIsLoading(false);
    }
  };

  onMount(() => {
    handleVisibilityChange();
    let firstRun = true;
    user.subscribe((value) => {
      if (firstRun) {
        firstRun = false;
        return;
      }
      const currentUser = $session.user;
      const currentAccessToken = $session.accessToken;
      if (value === null) {
        $session = { ...$session, user: null, accessToken: null };
      }

      if (
        (value && !dequal(currentUser, value)) ||
        ($accessToken && !dequal(currentAccessToken, $accessToken))
      ) {
        $session = {
          ...$session,
          user: value,
          accessToken: $accessToken
        };
      }
      onUserUpdate(value);
    });
    if (autoRefreshToken)
      window?.addEventListener('visibilitychange', handleVisibilityChange);
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') return;
        setIsLoading(true);
        // Forward session from client to server where it is set in a Cookie.
        // NOTE: this will eventually be removed when the Cookie can be set differently.
        await fetch(callbackUrl, {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session })
        }).then((res) => {
          if (!res.ok) {
            const err = new CallbackUrlFailed(callbackUrl);
            setError(err.message);
          }
        });
        // Fetch the user from the API route
        await checkSession({
          profileUrl,
          autoRefreshToken,
          supabaseClient
        });
        setIsLoading(false);
      }
    );
    return () => {
      window?.removeEventListener('visibilitychange', handleVisibilityChange);
      authListener?.unsubscribe();
    };
  });
</script>

<slot />
