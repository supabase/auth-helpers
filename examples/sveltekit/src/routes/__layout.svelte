<script>
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { supabaseClient } from '$lib/db';
	import { SupaAuthHelper } from '@supabase/auth-helpers-svelte';

	const onUserUpdate = async (user) => {
		// if (user) await goto('/profile');
	};
</script>

<SupaAuthHelper {supabaseClient} {onUserUpdate} {session}>
	<slot />
</SupaAuthHelper>
