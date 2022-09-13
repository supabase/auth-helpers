import { withAuth } from '@supabase/auth-helpers-sveltekit';
import type { PageLoad } from './$types';

export const load: PageLoad = withAuth({ status: 303, location: '/' }, ({ session }) => {
	return { user: session.user };
});
