<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	function signout() {
		data.supabase.auth.signOut();
	}

	onMount(() => {
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange(() => {
			console.log('CHANGED');

			invalidate('supabase:auth');
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

{#if data.session}
	<button on:click={signout}>Sign out</button>
{/if}

<slot />
