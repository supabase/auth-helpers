<script lang="ts" context="module">
	// this is needed to set the client instance
	// must happen in module context to ensure it´s run before any load functions
	import { supabaseClient } from '$lib/db';
	import { setupSupabase } from '@supabase/auth-helpers-sveltekit';

	setupSupabase({ supabaseClient });
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { startSupabaseSessionSync, enhanceAndInvalidate } from '@supabase/auth-helpers-sveltekit';

	// this sets up automatic token refreshing
	startSupabaseSessionSync();
</script>

{#if $page.data.session.user?.id}
	<form action="/logout" method="post" use:enhanceAndInvalidate>
		<button type="submit">Sign out</button>
	</form>
{/if}

<slot />
