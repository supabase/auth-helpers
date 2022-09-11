import { loadWithSession } from '@supabase/auth-helpers-sveltekit';
import type { PageLoad } from './$types';

export const load: PageLoad = loadWithSession({ status: 303, location: '/' }, ({ session }) => {
	return { user: session.user };
});
