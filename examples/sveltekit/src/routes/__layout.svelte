<script>
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { supabaseClient } from '$lib/db';
	import UserContext from '@supabase/auth-helpers-svelte';

	const redirectTo = async (user) => {
		await goto('/');
		session.set({ user });
	};
</script>

<UserContext {supabaseClient} cbRedirect={redirectTo}>
	<slot />
</UserContext>
