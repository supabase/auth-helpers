import { handleAuth } from '@supabase/auth-helpers-remix';

export const loader = handleAuth();

export const action = handleAuth();
