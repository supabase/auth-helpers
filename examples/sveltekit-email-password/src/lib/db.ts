import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { setupSupabaseClient } from '@supabase/auth-helpers-sveltekit';

export const supabaseClient = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
	persistSession: false,
	autoRefreshToken: false
});

setupSupabaseClient({
	supabaseClient
});
