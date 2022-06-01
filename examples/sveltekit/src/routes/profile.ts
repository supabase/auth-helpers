import { withApiAuth } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ locals }) =>
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
