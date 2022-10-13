import type { CookieSerializeOptions } from 'cookie';
import type { SupabaseClientOptions as _SupabaseClientOptions } from '@supabase/supabase-js';

export type CookieOptions = { name?: string } & Pick<
  CookieSerializeOptions,
  'domain' | 'secure' | 'path' | 'sameSite' | 'maxAge'
>;

export type SupabaseClientOptions<T = 'public'> = Omit<
  _SupabaseClientOptions<T>,
  'auth'
>;
