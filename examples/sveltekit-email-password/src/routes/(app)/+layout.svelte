<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	const handleLogout: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'redirect') {
				await invalidateAll();
			}
			await applyAction(result);
		};
	};
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
			{#if $page.data.session}
				<form action="/logout" method="post" use:enhance={handleLogout}>
					<button type="submit">Sign out</button>
				</form>
			{/if}
		</div>
	</div>

	<slot />
</main>
