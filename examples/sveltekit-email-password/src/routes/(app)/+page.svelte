<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	export let form: any;
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
		<h1 class="title">Sign in</h1>
		{#if form?.error}
			<div class="block notification is-danger">{form.error}</div>
		{/if}
		<form method="post" use:enhance={handleSubmit}>
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
				Don't have an account? <a href="/signup">Sign up</a>
			</p>
		</div>
	</div>
</section>
