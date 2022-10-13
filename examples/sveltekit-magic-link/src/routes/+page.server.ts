import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { invalid } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async default(event) {
		const { request, url } = event;
		const { supabaseClient } = await getSupabase(event);

		const formData = await request.formData();
		const email = formData.get('email') as string;

		const { error } = await supabaseClient.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${url.origin}/logging-in`
			}
		});

		if (error) {
			return invalid(400, {
				error: error.message,
				values: { email }
			});
		}

		return {
			success: true,
			message: 'Please check your email for a magic link to log into the website.'
		};
	}
};
