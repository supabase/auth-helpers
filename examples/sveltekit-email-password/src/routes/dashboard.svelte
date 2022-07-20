<script lang="ts">
	import type { TestTable } from '$lib/types';
	import type { User } from '@supabase/supabase-js';

	export let data: TestTable[];
	export let user: User;
</script>

<div class="block">
	<p>Protected content for {user.email}</p>
	<p>server-side fetched data with RLS:</p>
	<pre>{JSON.stringify(data, null, 2)}</pre>
</div>
<div class="block">
	<p>user:</p>
	<pre>{JSON.stringify(user, null, 2)}</pre>
</div>
