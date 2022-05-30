import type { User } from '@supabase/supabase-js';
import { isFunction } from './guards';

interface ApiAuthOpts {
  redirectTo?: string;
  status?: number;
  user: User;
}

export default async function withApiAuth(
  { redirectTo = '/', user, status = 303 }: ApiAuthOpts,
  fn: () => {}
) {
  if (!user) {
    return {
      status,
      headers: {
        location: redirectTo
      }
    };
  }

  if (isFunction(fn)) {
    return fn();
  }

  return {
    status: 200
  };
}
