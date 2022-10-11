<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ tableData, user } = data);
</script>

<p>
	[<a href="/">Home</a>] | [<a href="/profile">withPageAuth</a>] | [<a href="/github-provider-token"
		>GitHub Token</a
	>]
</p>
<div>Protected content for {user.email}</div>
<p>server-side fetched data with RLS:</p>
<pre>{JSON.stringify(tableData, null, 2)}</pre>
<p>user:</p>
<pre>{JSON.stringify(user, null, 2)}</pre>
