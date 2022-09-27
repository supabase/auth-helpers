<script lang="ts">
	import '$lib/db';
	import { startSupabaseSessionSync } from '@supabase/auth-helpers-sveltekit';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	// this sets up automatic token refreshing
	startSupabaseSessionSync({
		page,
		handleRefresh: () => invalidateAll()
	});
</script>

<svelte:head>
	<title>Supabase Auth Helpers Demo</title>
</svelte:head>

<slot />
