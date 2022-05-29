<script lang="ts">
  import type { SupabaseClient, User } from '@supabase/supabase-js';
  import { onMount, setContext } from 'svelte';
  import { checkSession } from './helpers';
  import { store } from './store';

  // Props
  export let supabaseClient: SupabaseClient;
  export let callbackUrl = '/api/auth/callback';
  export let profileUrl = '/api/auth/user';
  export let autoRefreshToken = true;
  export let cbRedirect = (user: User | null) => {};
  export const key = 'sb-auth-helpers-svelte-ctx';

  const { setIsLoading, setError } = store;

  const handleVisibilityChange = async () => {
    if (document?.visibilityState === 'visible') {
      setIsLoading(true);
      await checkSession({ profileUrl, autoRefreshToken, supabaseClient });
      setIsLoading(false);
    }
  };

  onMount(() => {
    handleVisibilityChange();
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
            const err = new Error(`The request to ${callbackUrl} failed`);
            setError(err);
          }
        });
        // Fetch the user from the API route
        const { user } = await checkSession({
          profileUrl,
          autoRefreshToken,
          supabaseClient
        });
        setIsLoading(false);
        cbRedirect(user);
      }
    );
    return () => {
      window?.removeEventListener('visibilitychange', handleVisibilityChange);
      authListener?.unsubscribe();
    };
  });

  setContext(key, store);
</script>

<slot />
