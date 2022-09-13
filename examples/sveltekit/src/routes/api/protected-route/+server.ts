import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface TestTable {
	id: string;
	created_at: string;
}

export const GET: RequestHandler = withAuth(
	{ status: 401, error: { message: 'Unauthorized' } },
	async ({ getSupabaseClient }) => {
		const { data } = await getSupabaseClient().from<TestTable>('test').select('*');

		return json({ data });
	}
);
