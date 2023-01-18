import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseClient } from '@supabase/auth-helpers-sveltekit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, fetch, depends }) => {
	depends('supabase:auth');

	const supabase = createSupabaseClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		initialSession: data.session,
		options: {
			global: {
				fetch
			}
		},
		cookieOptions: {
			name: 'sb-auth-token',
			path: '/',
			maxAge: 1000 * 60 * 60 * 24 * 365
		}
	});

	const {
		data: { session }
	} = await supabase.auth.getSession();

	return { supabase, session };
};
