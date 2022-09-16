<script lang="ts">
	import '$lib/db';
	import { startSupabaseSessionSync } from '@supabase/auth-helpers-sveltekit';

	// this sets up automatic token refreshing
	startSupabaseSessionSync();
</script>

<svelte:head>
	<title>Supabase Auth Helpers Demo</title>
</svelte:head>

<slot />
