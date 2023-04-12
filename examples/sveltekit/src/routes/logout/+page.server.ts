import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async default({ locals: { supabase } }) {
		await supabase.auth.signOut();
		throw redirect(303, '/');
	}
};
