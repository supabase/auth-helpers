<script>
	import { session } from '$app/stores';
	import { supabaseClient } from '$lib/db';
	import { SupaAuthHelper } from '@supabase/auth-helpers-svelte';
</script>

<svelte:head>
	<title>Supabase Auth Helpers Demo</title>
</svelte:head>

<SupaAuthHelper {supabaseClient} {session}>
	<slot />
</SupaAuthHelper>
