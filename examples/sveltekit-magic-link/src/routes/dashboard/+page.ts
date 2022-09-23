import type { PageLoad } from './$types';
import { withAuth } from '@supabase/auth-helpers-sveltekit';
import type { TestTable } from '$lib/types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = withAuth(async ({ session, getSupabaseClient }) => {
	if (!session.user) {
		throw redirect(303, '/');
	}
	const { data: testTable } = await getSupabaseClient().from<TestTable>('test').select('*');
	return {
		testTable,
		user: session.user
	};
});
