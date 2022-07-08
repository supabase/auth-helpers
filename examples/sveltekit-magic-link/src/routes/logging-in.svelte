<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let redirectPath = '/dashboard';
	onMount(async () => {
		await new Promise((r) => setTimeout(r, 1000));
		goto(redirectPath);
	});

	$: {
		const redirectTo = $page.url.searchParams.get('redirect');
		if (redirectTo) {
			redirectPath = redirectTo;
		}
	}
</script>

<progress class="progress is-small is-primary" max="100">15%</progress>
