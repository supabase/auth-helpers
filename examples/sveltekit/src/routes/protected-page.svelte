<script context="module">
	import { supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-sveltekit';
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export const load = async ({ session }) =>
		withPageAuth(
			{
				redirectTo: '/',
				user: session.user
			},
			async () => {
				const { data } = await supabaseServerClient(session.accessToken).from('test').select('*');
				return { props: { data, user: session.user } };
			}
		);
</script>

<script>
	import { supabaseClient } from '$lib/db';

	export let data;
	export let user;
</script>

<p>
	<a href="/">[Home]</a>
	<a href="/profile">[withAuthRequired]</a>
</p>
<button on:click={async () => await supabaseClient.auth.signOut()}>Sign out</button>
<div>Protected content for {user.email}</div>
<p>server-side fetched data with RLS:</p>
<pre>{JSON.stringify(data, null, 2)}</pre>
<p>user:</p>
<pre>{JSON.stringify(user, null, 2)}</pre>
