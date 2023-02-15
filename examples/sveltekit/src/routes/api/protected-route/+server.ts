import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw error(401, { message: 'Unauthorized' });
	}
	const { data } = await supabase.from('test').select('*');

	return json({ data });
};
