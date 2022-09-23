import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface TestTable {
	id: string;
	created_at: string;
}

export const GET: RequestHandler = withAuth(async ({ getSupabaseClient, session }) => {
	if (!session.user) {
		throw error(401, { message: 'Unauthorized' });
	}
	const { data } = await getSupabaseClient().from<TestTable>('test').select('*');

	return json({ data });
});
