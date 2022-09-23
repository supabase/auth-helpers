<script lang="ts">
	import { page } from '$app/stores';
	import { enhanceAndInvalidate } from '@supabase/auth-helpers-sveltekit';
</script>

<svelte:head>
	<title>Email and Password Demo - Supabase Auth Helpers</title>
</svelte:head>

<main class="container is-max-desktop">
	<div class="navbar-menu my-4">
		<div class="navbar-start">
			<a class="my-2" href="/">Supabase Auth Helpers Demo</a>
		</div>
		<div class="navbar-end">
			{#if $page.data.session.user}
				<form action="/logout" method="post" use:enhanceAndInvalidate>
					<button type="submit">Sign out</button>
				</form>
			{/if}
		</div>
	</div>

	<slot />
</main>
