import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { withAuth } from '@supabase/auth-helpers-sveltekit';

export const load: PageLoad = withAuth(({ session }) => {
	if (session.user) {
		throw redirect(303, '/dashboard');
	}
});
