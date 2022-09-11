import { loadWithSession, supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { PageLoad } from './$types';

export const load: PageLoad = loadWithSession(
	{ status: 303, location: '/' },
	async ({ session }) => {
		const { data: tableData } = await supabaseServerClient(session.accessToken)
			.from('test')
			.select('*');
		return { tableData, user: session.user };
	}
);
