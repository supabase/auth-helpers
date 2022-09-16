<script lang="ts" context="module">
	// this is needed to set the client instance
	// must happen in module context to ensure it´s run before any load functions
	import { supabaseClient } from '$lib/db';
	import { setupSupabaseClient } from '@supabase/auth-helpers-sveltekit';

	setupSupabaseClient({ supabaseClient });
</script>

<script lang="ts">
	import { startSupabaseSessionSync } from '@supabase/auth-helpers-sveltekit';

	// this sets up automatic token refreshing
	startSupabaseSessionSync();
</script>

<svelte:head>
	<title>Supabase Auth Helpers Demo</title>
</svelte:head>

<slot />
