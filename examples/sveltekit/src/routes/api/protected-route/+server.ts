import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { serverWithSession } from '@supabase/auth-helpers-sveltekit/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface TestTable {
	id: string;
	created_at: string;
}

export const GET: RequestHandler = serverWithSession(
	{ status: 403, error: { message: 'Unauthorized' } },
	async ({ session }) => {
		const { data } = await supabaseServerClient(session.accessToken)
			.from<TestTable>('test')
			.select('*');

		return json({ data });
	}
);
