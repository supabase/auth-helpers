<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
	$: supabase = data.supabase;

	let loadedData: any[] = [];
	async function loadData() {
		const { data, error } = await supabase.from('test').select('*');

		if (!error) {
			loadedData = data;
		}
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
			supabase.auth.signInWithOAuth({
				provider: 'github',
				options: {
					scopes: 'public_repo user:email',
					redirectTo: `${$page.url.origin}/api/auth/callback`
				}
			});
		}}
	>
		GitHub with scopes
	</button>
	<button
		on:click={() => {
			supabase.auth.signInWithOAuth({
				provider: 'google',
				options: { scopes: 'https://www.googleapis.com/auth/userinfo.email' }
			});
		}}
	>
		Google
	</button>
{:else}
	<p>
		[<a href="/profile">withPageAuth</a>] | [<a href="/protected-page">supabaseServerClient</a>] | [<a
			href="/github-provider-token">GitHub Token</a
		>] |
		<button on:click={() => supabase.auth.updateUser({ data: { test5: 'updated' } })}>
			Update
		</button>
	</p>

	<p>user:</p>
	<pre>{JSON.stringify($page.data.session.user, null, 2)}</pre>
	<p>client-side data fetching with RLS</p>
	<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
