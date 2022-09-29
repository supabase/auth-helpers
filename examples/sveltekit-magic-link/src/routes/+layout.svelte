<script lang="ts">
	import { supabaseClient } from '$lib/db';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

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

<svelte:head>
	<title>Supabase Auth Helpers Demo</title>
</svelte:head>

<slot />
