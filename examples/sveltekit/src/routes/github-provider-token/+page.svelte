<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ allRepos, user } = data);
</script>

<p>
	<a href="/">[Home]</a> |
	<a href="/profile">[withPageAuth]</a>
</p>

<div>Hello {user.email}</div>
<p>Data fetched with provider token:</p>
<pre>{JSON.stringify(allRepos, null, 2)}</pre>
<p>user:</p>
<pre>{JSON.stringify(user, null, 2)}</pre>
