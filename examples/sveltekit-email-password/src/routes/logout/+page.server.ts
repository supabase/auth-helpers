import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: withAuth(async ({ supabaseClient }) => {
		await supabaseClient.auth.signOut();
		throw redirect(303, '/');
	})
};
