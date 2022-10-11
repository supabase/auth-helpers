<script lang="ts">
	import { supabaseClient } from '$lib/db';
	import { page } from '$app/stores';

	let loadedData: any[] = [];
	async function loadData() {
		const { data } = await supabaseClient.from('test').select('*').single();
		loadedData = data;
	}

	$: if ($page.data.session) {
		loadData();
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if !$page.data.session}
	<button
		on:click={() => {
			supabaseClient.auth.signInWithOAuth({
				provider: 'github',
				options: { scopes: 'public_repo user:email' }
			});
		}}
	>
		GitHub with scopes
	</button>
{:else}
	<p>
		[<a href="/profile">withPageAuth</a>] | [<a href="/protected-page">supabaseServerClient</a>] | [<a
			href="/github-provider-token">GitHub Token</a
		>] |
		<button on:click={() => supabaseClient.auth.updateUser({ data: { test5: 'updated' } })}>
			Update
		</button>
	</p>

	<p>user:</p>
	<pre>{JSON.stringify($page.data.session.user, null, 2)}</pre>
	<p>client-side data fetching with RLS</p>
	<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
