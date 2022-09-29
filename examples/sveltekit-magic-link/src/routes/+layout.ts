import type { LayoutLoad } from './$types';
import { withAuth } from '@supabase/auth-helpers-sveltekit';

export const load: LayoutLoad = withAuth(async ({ session }) => {
	return { session };
});
