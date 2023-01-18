import type { CookieOptions } from '@supabase/auth-helpers-shared';
import type {
  Session,
  SupabaseClient,
  SupabaseClientOptions
} from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient<
  App.Supabase['Database'],
  App.Supabase['SchemaName']
>;

export interface ExtendedEvent {
  session: Session | null;
  supabaseClient: TypedSupabaseClient;
}

export interface Config {
  globalInstance: TypedSupabaseClient;
  supabaseUrl: string;
  supabaseKey: string;
  options: SupabaseClientOptions<App.Supabase['SchemaName']>;
  cookieOptions: CookieOptions;
}

// Default Supabase interface that can be extended by the user
declare global {
  namespace App {
    interface Supabase {
      Database: any;
      SchemaName: 'public';
    }
  }
}
