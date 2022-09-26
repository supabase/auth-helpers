<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	export let errors: Record<string, string> = {};
	export let values: Record<string, string> = {};
	export let message: string = '';
	let loading = false;

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			loading = false;
			await applyAction(result);
			if (result.type === 'redirect') {
				await invalidateAll();
			}
		};
	};
</script>

<section class="columns mt-6 pt-6">
	<div class="column is-half is-offset-one-quarter">
		<h1 class="title">Sign up</h1>
		{#if errors}
			<div class="block notification is-danger">{errors.form}</div>
		{/if}
		{#if message}
			<div class="block notification is-primary">{message}</div>
		{/if}
		<form method="post" use:enhance={handleSubmit}>
			<div class="field">
				<label for="email" class="label">Email</label>
				<p class="control">
					<input
						id="email"
						name="email"
						value={values?.email ?? ''}
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
						value={values?.password ?? ''}
						class="input"
						type="password"
						placeholder="Password"
						required
					/>
				</p>
			</div>
			<div class="field">
				<p class="control">
					<button disabled={loading} class="button is-fullwidth is-link">Sign up</button>
				</p>
			</div>
		</form>

		<div class="mt-6">
			<p class="has-text-centered">
				Already have an account? <a href="/">Sign in</a>
			</p>
		</div>
	</div>
</section>
