<script lang="ts">
	import { supabaseClient } from '$lib/db';
	import { startSupabaseSessionSync } from '@supabase/auth-helpers-sveltekit';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	// this sets up automatic token refreshing
	startSupabaseSessionSync({
		page,
		handleRefresh: () => invalidateAll()
	});

	function signout() {
		supabaseClient.auth.signOut();
	}
</script>

{#if $page.data.session.user}
	<button on:click={signout}>Sign out</button>
{/if}

<slot />
