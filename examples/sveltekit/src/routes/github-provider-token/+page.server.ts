import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { getProviderToken } from '@supabase/auth-helpers-sveltekit/server';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface GitHubOutput {
	total_count: number;
	incomplete_results: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	items: any[];
}

export const load: PageServerLoad = withAuth(async ({ session, cookies }) => {
	if (!session.user) {
		throw redirect(303, '/');
	}
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
});
