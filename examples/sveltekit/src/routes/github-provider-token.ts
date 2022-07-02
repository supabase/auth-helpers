import { parseCookie } from '$lib/parseCookie';
import { withApiAuth } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ locals, request }) =>
	withApiAuth(
		{
			redirectTo: '/',
			user: locals.user
		},
		async () => {
			const cookies = parseCookie(request.headers.get('cookie'));
			const providerToken = cookies['sb-provider-token'];
			const userId = locals.user?.user_metadata.user_name;
			const allRepos = await (await fetch(
				`https://api.github.com/search/repositories?q=user:${userId}`,
				{
				  method: 'GET',
				  headers: {
					Authorization: `token ${providerToken}`
				  }
				}
			)).json()

			return {
				body: {
					user: locals.user,
					allRepos
				}
			};
		}
	);
