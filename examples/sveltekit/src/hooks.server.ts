import { dev } from '$app/environment';
import { supabaseClient } from '$lib/db';
import { setupSupabaseServer } from '@supabase/auth-helpers-sveltekit/server';
import { auth } from '@supabase/auth-helpers-sveltekit/server';

setupSupabaseServer({
	supabaseClient,
	cookieOptions: {
		secure: !dev
	}
});

export const handle = auth;
