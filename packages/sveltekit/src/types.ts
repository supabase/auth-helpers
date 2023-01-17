import type {
  CookieOptions,
  SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient<
  App.Supabase['Database'],
  App.Supabase['SchemaName']
>;

export interface Config {
  globalInstance: TypedSupabaseClient;
  supabaseUrl: string;
  supabaseKey: string;
  options: SupabaseClientOptionsWithoutAuth<App.Supabase['SchemaName']>;
  cookieOptions: CookieOptions;
}
