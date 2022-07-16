import type { RequestHandler } from './__types/dashboard';
import { supabaseServerClient, withApiAuth, type User } from '@supabase/auth-helpers-sveltekit';
import type { TestTable } from '$lib/types';

interface GetOutput {
	user: User;
	data: TestTable[];
}

export const GET: RequestHandler<GetOutput> = async ({ locals, request }) =>
	withApiAuth(
		{
			redirectTo: '/',
			user: locals.user
		},
		async () => {
			const { data } = await supabaseServerClient(request).from<TestTable>('test').select('*');
			return {
				body: {
					data,
					user: locals.user
				}
			};
		}
	);
