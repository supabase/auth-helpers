import {
  CookieOptions,
  createBrowserSupabaseClient as _createBrowserSupabaseClient
} from '@supabase/auth-helpers-shared';

// Types
export type { Session, User, SupabaseClient } from '@supabase/supabase-js';

// Methods
export * from './middleware';
export { default as withPageAuth } from './utils/withPageAuth';
export { default as withApiAuth } from './utils/withApiAuth';
export { default as logger } from './utils/log';

export function createBrowserSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>({
  cookieOptions
}: {
  cookieOptions?: CookieOptions;
} = {}) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables are required!'
    );
  }

  return _createBrowserSupabaseClient<Database, SchemaName>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    cookieOptions
  });
}
