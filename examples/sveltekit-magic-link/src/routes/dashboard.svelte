<script>
	import Layout from './_layout.svelte';

	export let data;
	export let user;
</script>

<Layout>
	<div class="block">
		<p>Protected content for {user.email}</p>
		<p>server-side fetched data with RLS:</p>
		<pre>{JSON.stringify(data, null, 2)}</pre>
	</div>
	<div class="block">
		<p>user:</p>
		<pre>{JSON.stringify(user, null, 2)}</pre>
	</div>
</Layout>
