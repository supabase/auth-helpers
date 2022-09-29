import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = withAuth(async ({ session, supabaseClient }) => {
	if (!session) {
		throw error(401, { message: 'Unauthorized' });
	}
	const { data } = await supabaseClient.from('test').select('*');

	return json({ data });
});
