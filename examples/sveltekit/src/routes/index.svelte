<script>
	import { onMount } from 'svelte';
	import { error, isLoading } from '@supabase/auth-helpers-svelte';
	import { supabaseClient } from '$lib/db';
	import { session } from '$app/stores';

	let auth;
	onMount(async () => {
		const { default: Auth } = await import('supabase-ui-svelte');
		auth = Auth;
	});

	let loadedData = [];
	async function loadData() {
		const { data } = await supabaseClient.from('test').select('*').single();
		loadedData = data;
	}

	$: {
		if ($session.user && $session.user.id) {
			loadData();
		}
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if !$session.user}
	{#if $error}
		<p>{$error.message}</p>
	{/if}
	<h1>{$isLoading ? `Loading...` : `Loaded!`}</h1>
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

	<h1>{$isLoading ? `Loading...` : `Loaded!`}</h1>
	<p>user:</p>
	<pre>{JSON.stringify($session.user, null, 2)}</pre>
	<p>client-side data fetching with RLS</p>
	<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
