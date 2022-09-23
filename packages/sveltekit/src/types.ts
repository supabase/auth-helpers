import type { SupabaseClient, User } from '@supabase/supabase-js';
import type {
  CookieOptions as SharedCookieOptions,
  ErrorPayload
} from '@supabase/auth-helpers-shared';

export interface CookieOptions extends SharedCookieOptions {
  secure?: boolean;
}

// it´s either an authenticated session and no error
// or a not authenticated session and an optional error
export type SupabaseSession =
  | {
      user: User;
      accessToken: string;
      error?: undefined;
    }
  | {
      user?: undefined;
      accessToken?: undefined;
      error?: ErrorPayload;
    };

export interface ExtendedEvent {
  getSupabaseClient(): SupabaseClient;
  session: SupabaseSession;
}

export interface SetupOptions {
  supabaseClient: SupabaseClient;
  tokenRefreshMargin?: number;
  endpointPrefix?: string;
  cookieOptions?: CookieOptions;
  getSessionFromPageData?: (data: App.PageData) => SupabaseSession;
  getSessionFromLocals?: (locals: App.Locals) => SupabaseSession;
  setSessionToLocals?: (locals: App.Locals, session: SupabaseSession) => void;
}

export interface Config extends Omit<Required<SetupOptions>, 'cookieOptions'> {
  cookieOptions: Required<CookieOptions>;
}
