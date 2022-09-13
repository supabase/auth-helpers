import type { PageLoad } from './$types';
import { withAuth } from '@supabase/auth-helpers-sveltekit';
import type { TestTable } from '$lib/types';

export const load: PageLoad = withAuth(
	{ status: 303, location: '/' },
	async ({ getSupabaseClient, session }) => {
		const { data: testTable } = await getSupabaseClient().from<TestTable>('test').select('*');
		return {
			testTable,
			user: session.user
		};
	}
);
