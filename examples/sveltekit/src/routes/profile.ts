import { withApiAuth, type User } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from './__types/profile';

interface GetOutput {
	user: User;
}

export const GET: RequestHandler<GetOutput> = async ({ locals }) =>
	withApiAuth(
		{
			redirectTo: '/',
			user: locals.user
		},
		() => {
			return {
				body: {
					user: locals.user
				}
			};
		}
	);
