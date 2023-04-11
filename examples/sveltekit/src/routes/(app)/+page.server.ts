import { AuthApiError, type Provider } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	'signin-with-password': async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!email) {
			return fail(400, {
				signinWithPassword: {
					error: 'Please enter your email',
					values: {
						email
					}
				}
			});
		}

		if (!password) {
			return fail(400, {
				signinWithPassword: {
					error: 'Please enter your password',
					values: {
						email
					}
				}
			});
		}

		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					signinWithPassword: {
						error: 'Invalid credentials.',
						values: {
							email
						}
					}
				});
			}
			return fail(500, {
				signinWithPassword: {
					error: 'Server error. Try again later.',
					values: {
						email
					}
				}
			});
		}

		throw redirect(303, '/dashboard');
	},

	'signin-with-oauth': async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const provider = formData.get('provider')?.toString();

		const {
			data: { url: oAuthUrl }
		} = await supabase.auth.signInWithOAuth({
			provider: provider as Provider,
			options: {
				redirectTo: `${url.origin}/api/auth/callback`
			}
		});

		if (!oAuthUrl) {
			return fail(500, {
				signinWithOAuth: {
					error: `Could not get provider url for ${provider}`
				}
			});
		}

		throw redirect(303, oAuthUrl);
	},

	'send-magiclink': async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();

		if (!email) {
			return fail(500, {
				createMagicLink: {
					error: 'Please enter your email'
				}
			});
		}

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${url.origin}/api/auth/callback`
			}
		});

		if (!error) {
			return fail(500, {
				createMagicLink: {
					values: {
						email
					},
					error: 'Could not send magiclink'
				}
			});
		}

		return {
			createMagicLink: {
				success: true
			}
		};
	}
};
