import { dev } from '$app/environment';
import { supabaseClient } from '$lib/db';
import { auth } from '@supabase/auth-helpers-sveltekit/server';

export const handle = auth({
	supabaseClient,
	cookieOptions: {
		secure: !dev
	}
});
