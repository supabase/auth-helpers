import { getProviderToken } from '@supabase/auth-helpers-sveltekit';
import { withApiAuth, type User } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from './__types/github-provider-token';

interface GitHubOutput {
	total_count: number;
	incomplete_results: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	items: any[];
}

interface GetOutput {
	user: User;
	allRepos: GitHubOutput;
}

export const GET: RequestHandler<GetOutput> = async ({ locals, request }) =>
	withApiAuth(
		{
			redirectTo: '/',
			user: locals.user
		},
		async () => {
			const providerToken = getProviderToken(request);
			const userId = locals.user?.user_metadata.user_name;
			const allRepos = await (
				await fetch(`https://api.github.com/search/repositories?q=user:${userId}`, {
					method: 'GET',
					headers: {
						Authorization: `token ${providerToken}`
					}
				})
			).json();

			return {
				body: {
					user: locals.user,
					allRepos
				}
			};
		}
	);
