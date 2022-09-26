import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = withAuth(async ({ session, getSupabaseClient }) => {
	if (!session.user) {
		throw redirect(303, '/');
	}
	const { data: tableData } = await getSupabaseClient().from('test').select('*');
	return { tableData, user: session.user };
});
