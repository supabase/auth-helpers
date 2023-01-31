<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import Layout from './Layout.svelte';

	export let form: any;
	let loading = false;

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			await applyAction(result);
			loading = false;
		};
	};
</script>

<Layout>
	<section class="columns mt-6 pt-6">
		<div class="column is-half is-offset-one-quarter">
			{#if form?.error}
				<div class="block notification is-danger">{form.error}</div>
			{/if}
			{#if form?.message}
				<div class="block notification is-primary">{form.message}</div>
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
					<p class="control">
						<button disabled={loading} class="button is-fullwidth is-link">Login</button>
					</p>
				</div>
			</form>
		</div>
	</section>
</Layout>
