import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = withAuth(async ({ session }) => {
	if (!session) {
		throw redirect(303, '/');
	}
	return { user: session.user };
});
