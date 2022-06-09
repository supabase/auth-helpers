// Types
export type { User } from '@supabase/supabase-js';

// Methods
export * from './handlers';
export { default as getUser } from './utils/getUser';
export { default as withPageAuth } from './utils/withAuth';
export { default as supabaseServerClient } from './utils/supabaseClient.server';
export { supabaseClient, SupabaseClient } from './utils/initSupabase.server';
