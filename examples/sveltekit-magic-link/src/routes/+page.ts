import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';

export const load: PageLoad = async (event) => {
	const { session } = await getSupabase(event);
	if (session) {
		throw redirect(303, '/dashboard');
	}
};
