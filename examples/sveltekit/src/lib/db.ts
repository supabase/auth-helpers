import { createClient } from '@supabase/supabase-js';
import { setupSupabaseHelpers } from '@supabase/auth-helpers-sveltekit';
import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';

export const supabaseClient = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
	persistSession: false,
	autoRefreshToken: false
});

setupSupabaseHelpers({
	supabaseClient,
	cookieOptions: {
		secure: !dev
	}
});
