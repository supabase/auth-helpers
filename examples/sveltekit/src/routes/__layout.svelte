<script>
	import { supabaseClient } from '$lib/db';
	import UserContext from '$lib/UserContext.svelte';
</script>

<UserContext {supabaseClient}>
	<slot />
</UserContext>
