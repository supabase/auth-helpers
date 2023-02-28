import { AuthApiError } from '@supabase/supabase-js';
import { fail, type ActionFailure } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async default({
		request,
		url,
		locals: { supabase }
	}): Promise<ActionFailure<{ error: string; values?: { email: string } }> | { message: string }> {
		const formData = await request.formData();

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email) {
			return fail(400, {
				error: 'Please enter your email'
			});
		}
		if (!password) {
			return fail(400, {
				error: 'Please enter a password',
				values: {
					email
				}
			});
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: url.origin }
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.',
					values: {
						email
					}
				});
			}

			return fail(500, {
				error: 'Server error. Try again later.',
				values: {
					email
				}
			});
		}

		return {
			message: 'Please check your email for a magic link to log into the website.'
		};
	}
};
