<script>
	import Auth from 'supabase-ui-svelte';
	import { key } from '$lib/UserContext.svelte';
	import { supabaseClient } from '$lib/db';
	import { getContext } from 'svelte';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';

	const { isLoading, error } = getContext(key);
	let loadedData = [];
	async function loadData() {
		const { data } = await supabaseClient.from('test').select('*').single();
		loadedData = data;
	}

	async function signOut() {
		await supabaseClient.auth.signOut();
		await goto('/');
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
	<Auth {supabaseClient} providers={[]} />
{:else}
	<a href="/about">About</a>
	<a href="/hello">Hello</a>

	<button on:click={signOut}>Sign out</button>
	<h1>{$isLoading ? `Loading...` : `Loaded!`}</h1>
	<p>user:</p>
	<pre>{JSON.stringify($session.user, null, 2)}</pre>
	<p>client-side data fetching with RLS</p>
	<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
