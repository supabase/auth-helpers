<script>
	import { session } from '$app/stores';
</script>

<a href="/">Home</a>
<a href="/hello">Hello</a>

<h1>About page</h1>

<p>user:</p>
<pre>{JSON.stringify($session.user, null, 2)}</pre>
