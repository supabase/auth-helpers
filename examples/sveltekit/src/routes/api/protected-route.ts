import { supabaseServerClient, withApiAuthRequired } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = ({ locals, request }) =>
	withApiAuthRequired({ user: locals.user }, async () => {
		const { data } = await supabaseServerClient(request).from('test').select('*');

		return {
			status: 200,
			body: data
		};
	});
