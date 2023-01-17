import type { CookieOptions } from '@supabase/auth-helpers-shared';
import type {
  SupabaseClient,
  SupabaseClientOptions
} from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient<
  App.Supabase['Database'],
  App.Supabase['SchemaName']
>;

export interface Config {
  globalInstance: TypedSupabaseClient;
  supabaseUrl: string;
  supabaseKey: string;
  options: SupabaseClientOptions<App.Supabase['SchemaName']>;
  cookieOptions: CookieOptions;
}
