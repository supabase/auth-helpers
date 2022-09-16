<script lang="ts" context="module">
	// this is needed to set the client instance
	// must happen in module context to ensure it´s run before any load functions
	import { supabaseClient } from '$lib/db';
	import { setupSupabaseClient } from '@supabase/auth-helpers-sveltekit';

	setupSupabaseClient({ supabaseClient });
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { startSupabaseSessionSync } from '@supabase/auth-helpers-sveltekit';

	// this sets up automatic token refreshing
	startSupabaseSessionSync();

	function signout() {
		supabaseClient.auth.signOut();
	}
</script>

{#if $page.data.session}
	<button on:click={signout}>Sign out</button>
{/if}

<slot />
