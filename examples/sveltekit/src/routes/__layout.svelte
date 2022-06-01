<script>
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { supabaseClient } from '$lib/db';
	import { AuthHelper } from '@supabase/auth-helpers-svelte';

	const onUserUpdate = async (user) => {
		if (user) await goto('/profile');
	};
</script>

<AuthHelper {supabaseClient} {onUserUpdate} {session}>
	<slot />
</AuthHelper>
