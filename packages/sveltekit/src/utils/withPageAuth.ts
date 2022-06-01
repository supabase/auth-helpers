import type { User } from '@supabase/supabase-js';
import type { LoadOutput } from '@sveltejs/kit';
import { isFunction } from './guards';

interface PageAuthOpts {
  redirectTo?: string;
  status?: number;
  user: User;
}

/**
 *
 * @param {Object} options
 * @param {string} options.redirectTo
 * @param {Object} options.user
 * @param {number} options.status
 * @param fn
 * @returns
 */
export default async function withPageAuth(
  { redirectTo = '/', user, status = 303 }: PageAuthOpts,
  fn?: () => LoadOutput | Promise<LoadOutput>
) {
  if (!user) {
    return {
      redirect: redirectTo,
      status
    };
  }

  if (isFunction(fn)) {
    return fn();
  }

  return {
    status: 200
  };
}
