import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { session, supabase } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}
	const { data: tableData, error } = await supabase.from('test').select('*');
	console.log(error);
	// console.log(tableData);

	return { tableData, user: session.user };
};
