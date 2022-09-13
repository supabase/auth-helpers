import { withAuth } from '@supabase/auth-helpers-sveltekit';
import type { PageLoad } from './$types';

export const load: PageLoad = withAuth(
	{ status: 303, location: '/' },
	async ({ session, getSupabaseClient }) => {
		const { data: tableData } = await getSupabaseClient().from('test').select('*');
		return { tableData, user: session.user };
	}
);
