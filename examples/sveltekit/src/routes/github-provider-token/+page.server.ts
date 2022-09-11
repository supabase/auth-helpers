import { serverLoadWithSession, getProviderToken } from '@supabase/auth-helpers-sveltekit/server';
import type { PageServerLoad } from './$types';

interface GitHubOutput {
	total_count: number;
	incomplete_results: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	items: any[];
}

export const load: PageServerLoad = serverLoadWithSession(
	{ status: 303, location: '/' },
	async ({ session, cookies }) => {
		const providerToken = getProviderToken(cookies);
		const userId = session.user.user_metadata.user_name;
		const allRepos: GitHubOutput = await (
			await fetch(`https://api.github.com/search/repositories?q=user:${userId}`, {
				method: 'GET',
				headers: {
					Authorization: `token ${providerToken}`
				}
			})
		).json();

		return {
			user: session.user,
			allRepos
		};
	}
);
