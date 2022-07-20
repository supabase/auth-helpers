import { supabaseServerClient, withApiAuth } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from './__types/protected-route';

interface TestTable {
	id: string;
	created_at: string;
}

interface GetOutput {
	data: TestTable[];
}

export const GET: RequestHandler<GetOutput> = async ({ locals, request }) =>
	withApiAuth({ user: locals.user }, async () => {
		const { data } = await supabaseServerClient(request).from<TestTable>('test').select('*');

		return {
			status: 200,
			body: { data }
		};
	});
