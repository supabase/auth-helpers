<script>
	import { session } from '$app/stores';
</script>

<main class="container is-max-desktop">
	<div class="navbar-menu my-4">
		<div class="navbar-start">
			<a class="my-2" href="/">Supabase Auth Helpers Demo</a>
		</div>
		<div class="navbar-end">
			{#if $session?.user?.id}
				<a class="button" href="/api/auth/logout">Sign out</a>
			{/if}
		</div>
	</div>
	<slot />
</main>
