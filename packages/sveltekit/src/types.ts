import type { CookieOptions } from '@supabase/auth-helpers-shared';
import type {
  Session,
  SupabaseClient,
  SupabaseClientOptions
} from '@supabase/supabase-js';

export interface ExtendedEvent {
  session: Session | null;
  supabaseClient: SupabaseClient;
}

export interface Config {
  globalInstance: SupabaseClient<
    App.Supabase['Database'],
    App.Supabase['SchemaName']
  >;
  supabaseUrl: string;
  supabaseKey: string;
  options: SupabaseClientOptions<App.Supabase['SchemaName']>;
  cookieOptions: CookieOptions;
}
