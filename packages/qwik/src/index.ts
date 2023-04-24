// Methods
export {
  createBrowserClient,
  createServerClient
} from './utils/createSupabaseClient';
export { default as logger } from './utils/log';

// Types
export type { Session, User, SupabaseClient } from '@supabase/supabase-js';
