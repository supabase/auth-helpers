import type { PageLoad } from './$types';
import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';

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
