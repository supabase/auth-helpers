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
		} = data.supabase.auth.onAuthStateChange((_event, session) => {
			if (data.session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
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
