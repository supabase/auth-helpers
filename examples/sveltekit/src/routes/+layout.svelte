<script lang="ts">
	import { supabaseClient } from '$lib/db';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	function signout() {
		supabaseClient.auth.signOut();
	}

	onMount(() => {
		const {
			data: { subscription }
		} = supabaseClient.auth.onAuthStateChange(() => {
			invalidateAll();
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

{#if $page.data.session}
	<button on:click={signout}>Sign out</button>
{/if}

<slot />
