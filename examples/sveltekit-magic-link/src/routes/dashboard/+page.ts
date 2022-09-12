import type { PageLoad } from './$types';
import { withSession } from '@supabase/auth-helpers-sveltekit';
import type { TestTable } from '$lib/types';

export const load: PageLoad = withSession(
	{ status: 303, location: '/' },
	async ({ session, getSupabaseClient }) => {
		const { data: testTable } = await getSupabaseClient().from<TestTable>('test').select('*');
		return {
			testTable,
			user: session.user
		};
	}
);
