import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = withAuth(({ session }) => {
	if (!session.user) {
		throw redirect(303, '/');
	}
	return { user: session.user };
});
