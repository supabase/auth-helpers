<script context="module">
	import { supabaseServerClient, withPageAuthRequired } from '@supabase/auth-helpers-sveltekit';
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export const load = async ({ session }) =>
		withPageAuthRequired(
			{
				redirectTo: '/',
				user: session.user
			},
			async () => {
				const { data } = await supabaseServerClient(session.accessToken).from('test').select('*');
				return { props: { data } };
			}
		);
</script>

<script>
	import { session } from '$app/stores';
	export let data;
</script>

<p>
	<a href="/">[Home]</a>
	<a href="/profile">[withAuthRequired]</a>
</p>
<div>Protected content for {$session.user.email}</div>
<p>server-side fetched data with RLS:</p>
<pre>{JSON.stringify(data, null, 2)}</pre>
<p>user:</p>
<pre>{JSON.stringify($session.user, null, 2)}</pre>
