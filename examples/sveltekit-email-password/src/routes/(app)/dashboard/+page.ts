import type { PageLoad } from './$types';
import { loadWithSession, supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { TestTable } from '$lib/types';

export const load: PageLoad = loadWithSession(
	{ status: 303, location: '/' },
	async ({ session }) => {
		const { data: testTable } = await supabaseServerClient(session.accessToken)
			.from<TestTable>('test')
			.select('*');
		return {
			testTable,
			user: session.user
		};
	}
);
