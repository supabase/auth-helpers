import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
	const { session } = await getSupabase(event);
	if (!session) {
		throw redirect(303, '/');
	}
	return { user: session.user };
};
