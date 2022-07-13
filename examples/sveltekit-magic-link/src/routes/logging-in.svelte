<script lang="ts">
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let redirectPath = '/dashboard';

	$: {
		const redirectTo = $page.url.searchParams.get('redirect');
		if (redirectTo) {
			redirectPath = redirectTo;
		}
		// check if user has been set in session store then redirect
		if ($session?.user?.id) {
			goto(redirectPath);
		}
	}
</script>

<section class="hero is-fullheight">
	<!-- Hero head: will stick at the top -->
	<div class="hero-head">
		<progress class="progress is-small is-info" max="100" />
	</div>

	<!-- Hero content: will be in the middle -->
	<div class="hero-body">
		<div class="container has-text-centered">
			<em class="subtitle">
				"Because as we know, there are known knowns; there are things we know we know. We also know
				there are known unknowns; that is to say we know there are some things we do not know. But
				there are also unknown unknowns—the ones we don't know we don't know"
			</em>
		</div>
	</div>
</section>

<style>
	.progress:indeterminate {
		animation-duration: 3.8s;
	}
</style>
