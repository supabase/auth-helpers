import type { CookieSerializeOptions } from 'cookie';
import type { SupabaseClientOptions } from '@supabase/supabase-js';

export type CookieOptions = Pick<
  CookieSerializeOptions,
  'domain' | 'secure' | 'path' | 'sameSite' | 'maxAge'
>;

export type CookieOptionsWithName = { name?: string } & CookieOptions;

export type SupabaseClientOptionsWithoutAuth<SchemaName = 'public'> = Omit<
  SupabaseClientOptions<SchemaName>,
  'auth'
>;
