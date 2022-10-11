import { supabaseClient } from '$lib/db';
import { invalid, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { saveSession } from '@supabase/auth-helpers-sveltekit/server';

export const actions: Actions = {
	async default({ request, cookies, url }) {
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
				error: 'Please enter your password',
				values: {
					email
				}
			});
		}

		const { data, error } = await supabaseClient.auth.api.signInWithEmail(email, password, {
			redirectTo: `${url.origin}/logging-in`
		});

		if (error || !data) {
			if (error?.status === 400) {
				return invalid(400, {
					error: 'Invalid credentials',
					values: {
						email
					}
				});
			}
			return invalid(500, {
				error: 'Server error. Try again later.',
				values: {
					email
				}
			});
		}

		saveSession(cookies, data);
		throw redirect(303, '/dashboard');
	}
};
