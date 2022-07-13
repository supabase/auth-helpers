<script>
	import Layout from './_layout.svelte';

	export let errors;
	export let values;
	export let message;
</script>

<Layout>
	<section class="columns mt-6 pt-6">
		<div class="column is-half is-offset-one-quarter">
			{#if errors}
				<div class="block notification is-danger">{errors.form}</div>
			{/if}
			{#if message}
				<div class="block notification is-primary">{message}</div>
			{/if}
			<form method="post">
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
					<p class="control">
						<button class="button is-fullwidth is-link">Login</button>
					</p>
				</div>
			</form>
		</div>
	</section>
</Layout>
