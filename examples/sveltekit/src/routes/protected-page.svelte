<script lang="ts" context="module">
	import { supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-sveltekit';
	import type { Load } from './__types/protected-page';

	export const load: Load = async ({ session }) =>
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
	export let data;
	export let user;
</script>

<p>
	[<a href="/">Home</a>] | [<a href="/profile">withPageAuth</a>] | [<a href="/github-provider-token"
		>GitHub Token</a
	>]
</p>
<div>Protected content for {user.email}</div>
<p>server-side fetched data with RLS:</p>
<pre>{JSON.stringify(data, null, 2)}</pre>
<p>user:</p>
<pre>{JSON.stringify(user, null, 2)}</pre>
