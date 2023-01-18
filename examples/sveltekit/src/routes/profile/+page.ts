import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { session } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}
	return { user: session.user };
};
