import { createSupabaseClient } from '@supabase/auth-helpers-sveltekit';

const { supabaseClient } = createSupabaseClient(
	import.meta.env.VITE_SUPABASE_URL as string,
	import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

export { supabaseClient };
