import '$lib/db';
import { auth } from '@supabase/auth-helpers-sveltekit/server';

export const handle = auth();
