import { browser } from '$app/environment';
import { invalidate } from '$app/navigation';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseClient } from '@supabase/auth-helpers-sveltekit';
import type { LayoutLoad } from './$types';

let started = false;

export const load: LayoutLoad = async ({ fetch, depends }) => {
	depends('supabase:auth');

	const supabase = createSupabaseClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		options: {
			global: {
				fetch
			}
		}
	});

	if (browser && !started) {
		started = true;
		supabase.auth.onAuthStateChange(() => {
			console.log('CHANGED');

			invalidate('supabase:auth');
		});
	}

	const {
		data: { session }
	} = await supabase.auth.getSession();

	return { supabase, session };
};
