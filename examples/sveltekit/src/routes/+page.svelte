<script lang="ts">
	import { onMount } from 'svelte';
	import { supabaseClient } from '$lib/db';
	import { page } from '$app/stores';

	let auth: typeof import('supabase-ui-svelte').default;
	onMount(async () => {
		const { default: Auth } = await import('supabase-ui-svelte');
		auth = Auth;
	});

	let loadedData: any[] = [];
	async function loadData() {
		const { data } = await supabaseClient.from('test').select('*').single();
		loadedData = data;
	}

	$: if ($page.data.session.user) {
		loadData();
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if !$page.data.session.user}
	<button
		on:click={() => {
			supabaseClient.auth.signIn({ provider: 'github' }, { scopes: 'public_repo user:email' });
		}}
	>
		GitHub with scopes
	</button>
	<svelte:component
		this={auth}
		{supabaseClient}
		providers={['google', 'github']}
		socialLayout="horizontal"
		socialButtonSize="large"
	/>
{:else}
	<p>
		[<a href="/profile">withPageAuth</a>] | [<a href="/protected-page">supabaseServerClient</a>] | [<a
			href="/github-provider-token">GitHub Token</a
		>] |
		<button on:click={() => supabaseClient.auth.update({ data: { test5: 'updated' } })}>
			Update
		</button>
	</p>

	<p>user:</p>
	<pre>{JSON.stringify($page.data.session.user, null, 2)}</pre>
	<p>client-side data fetching with RLS</p>
	<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
