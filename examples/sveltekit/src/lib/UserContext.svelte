<script context="module">
	export const key = {};
</script>

<script>
	import { setContext } from 'svelte';
	import { UserStore } from '@supabase/auth-helpers-sveltekit';

	export let supabaseClient;
	export let callbackUrl = '/api/auth/callback';
	export let redirectUrl = '/';

	const userStore = UserStore({ supabaseClient, callbackUrl, redirectUrl });

	userStore.checkAuthState();

	setContext(key, userStore);
</script>

<slot />
