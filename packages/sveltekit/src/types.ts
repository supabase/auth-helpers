import type { ApiError, User } from '@supabase/supabase-js';

export * from '$lib/shared';

export interface Locals {
  user: User;
  accessToken: string | null;
  error: ApiError;
}
