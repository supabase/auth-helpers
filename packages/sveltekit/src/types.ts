import type { ApiError, User } from '@supabase/supabase-js';

export interface Locals {
  user: User;
  accessToken: string | null;
  error: ApiError;
}
