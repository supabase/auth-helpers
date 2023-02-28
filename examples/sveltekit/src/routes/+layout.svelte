<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	function signout() {
		data.supabase.auth.signOut();
	}
</script>

{#if data.session}
	<button on:click={signout}>Sign out</button>
{/if}

<slot />
