import type { CookieSerializeOptions } from 'cookie';
import type { SupabaseClientOptions } from '@supabase/supabase-js';

export type CookieOptions = Pick<
  CookieSerializeOptions,
  'domain' | 'secure' | 'path' | 'sameSite' | 'maxAge'
>;

export type SupabaseClientOptionsWithoutAuth<T = 'public'> = Omit<
  SupabaseClientOptions<T>,
  'auth'
>;
