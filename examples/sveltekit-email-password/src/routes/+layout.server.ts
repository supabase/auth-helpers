import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		session: {
			user: locals.user,
			accessToken: locals.accessToken
		}
	};
};
