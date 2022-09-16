<script lang="ts">
	import { supabaseClient } from '$lib/db';
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
