import { supabaseClient } from '$lib/db';
import { invalid } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async default({ request, url }) {
		const formData = await request.formData();

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email) {
			return invalid(400, {
				error: 'Please enter your email'
			});
		}
		if (!password) {
			return invalid(400, {
				error: 'Please enter a password'
			});
		}

		const { data, error } = await supabaseClient.auth.api.signUpWithEmail(email, password, {
			redirectTo: url.origin
		});

		if (error || !data) {
			if (error?.status === 400) {
				return invalid(400, {
					error: 'Invalid credentials'
				});
			}
			return invalid(500, {
				error: 'Server error. Try again later.'
			});
		}

		return { success: true };
	}
};
