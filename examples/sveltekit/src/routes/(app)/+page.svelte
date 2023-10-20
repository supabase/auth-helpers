<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { page } from '$app/stores';

	export let form;
	let loading = false;

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			await applyAction(result);
			loading = false;
		};
	};
</script>

<section class="columns mt-6 pt-6">
	<div class="column is-half is-offset-one-quarter">
		<form class="mb-6" action="/?/signin-with-oauth" method="post" use:enhance={handleSubmit}>
			<button class="button" name="provider" value="github" type="submit">GitHub</button>
			<button class="button" name="provider" value="google" type="submit">Google</button>
		</form>

		<h1 class="title">Sign in</h1>
		{#if form?.error}
			<div class="block notification is-danger">{form.error}</div>
		{/if}

		{#if $page.url.searchParams.get('auth-type') === 'magiclink'}
			<form action="/?/send-magiclink" method="post" use:enhance={handleSubmit}>
				<div class="field">
					<label for="email" class="label">Email</label>
					<p class="control">
						<input
							id="email"
							name="email"
							value={form?.values?.email ?? ''}
							class="input"
							type="email"
							placeholder="Email"
							required
						/>
					</p>
				</div>
				<div class="field">
					<p class="control">
						<button disabled={loading} class="button is-fullwidth is-link">Send magic link</button>
					</p>
				</div>
			</form>

			<div class="mt-6">
				<p class="has-text-centered">
					<a href="/">Sign in with email and password</a>
				</p>
			</div>
		{:else}
			<!-- else content -->
			<form action="/?/signin-with-password" method="post" use:enhance={handleSubmit}>
				<div class="field">
					<label for="email" class="label">Email</label>
					<p class="control">
						<input
							id="email"
							name="email"
							value={form?.values?.email ?? ''}
							class="input"
							type="email"
							placeholder="Email"
							required
						/>
					</p>
				</div>
				<div class="field">
					<label for="password" class="label">Password</label>
					<p class="control">
						<input
							id="password"
							name="password"
							class="input"
							type="password"
							placeholder="Password"
							required
						/>
					</p>
				</div>
				<div class="field">
					<p class="control">
						<button disabled={loading} class="button is-fullwidth is-link">Sign in</button>
					</p>
				</div>
			</form>

			<div class="mt-6">
				<p class="has-text-centered">
					Sign in with <a href="?auth-type=magiclink">magiclink</a>
				</p>
				<p class="has-text-centered">
					Don't have an account? <a href="/signup">Sign up</a>
				</p>
			</div>
		{/if}
	</div>
</section>
