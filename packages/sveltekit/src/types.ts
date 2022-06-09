import type { User } from '@supabase/supabase-js';

export interface Locals {
  user: User | null;
  accessToken: string | null;
  error: string | null;
}
