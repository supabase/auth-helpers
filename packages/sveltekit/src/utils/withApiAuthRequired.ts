import type { User } from '@supabase/supabase-js';
import { isFunction } from './guards';

interface ApiAuthRequiredOpts {
  redirectTo?: string;
  status?: number;
  user: User;
}

export default async function withApiAuthRequired(
  { redirectTo = '/', user, status = 303 }: ApiAuthRequiredOpts,
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
