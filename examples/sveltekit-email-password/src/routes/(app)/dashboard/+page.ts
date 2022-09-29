import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { withAuth } from '@supabase/auth-helpers-sveltekit';

export const load: PageLoad = withAuth(async ({ session, supabaseClient }) => {
	if (!session) {
		throw redirect(303, '/');
	}

	const { data: testTable } = await supabaseClient.from('test').select('*');
	return {
		testTable,
		user: session.user
	};
});
