<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	let toUrl: URL;
	let loggedOut = false;

	beforeNavigate(({ cancel, to }) => {
		const session = $page.data.session;
		if (!session?.expires_at || !to) return;

		const now = Math.round(Date.now() / 1000);
		if (session.expires_at < now) {
			toUrl = to.url;

			cancel();
			loggedOut = true;
			console.log('about to log out');
		}
	});
</script>

<svelte:head>
	<title>Supabase Auth Helpers Demo</title>
</svelte:head>

<slot />

{#if loggedOut}
	<div>
		<p>You are beeing logged out</p>
		<a href="/">Sign back in</a>
	</div>
{/if}

<style>
	div {
		background-color: white;
		border-radius: 1em;
		z-index: 10;
		padding: 2em;
		box-shadow: 2px 1px 50px 20px rgba(0, 0, 0, 0.15);
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
