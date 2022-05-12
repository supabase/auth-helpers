import type { User } from '@supabase/supabase-js';

export type UserFetcher = (url: string) => Promise<{
  user: User | null;
  accessToken: string | null;
  error?: string | null;
}>;

export type UserState = {
  user: User | null;
  accessToken: string | null;
  error?: Error;
  isLoading: boolean;
  checkSession: () => Promise<void>;
};
