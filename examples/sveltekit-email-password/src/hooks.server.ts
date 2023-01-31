import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseClient, supabaseAuth } from '@supabase/auth-helpers-sveltekit';
import { sequence } from '$lib/sequence';

export const handle = sequence(
	supabaseAuth({
		cookieOptions: {
			path: '/',
			maxAge: 3600 * 24 * 365
		}
	}),
	async ({ event, resolve }) => {
		event.locals.supabase = createSupabaseClient({
			supabaseUrl: PUBLIC_SUPABASE_URL,
			supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
			options: {
				global: {
					fetch: event.fetch
				}
			}
		});

		return resolve(event);
	}
);
