import type { User } from '@supabase/supabase-js';
import type { ErrorPayload } from '@supabase/auth-helpers-shared';

export interface Locals {
  user: User | null;
  accessToken: string | null;
  error: ErrorPayload;
}

export interface RequestResponse {
  req: Request;
  res: Response;
}
