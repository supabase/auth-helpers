import '$lib/db';
import { allowSupabaseServerSideRequests } from '@supabase/auth-helpers-sveltekit';

export const handle = allowSupabaseServerSideRequests;