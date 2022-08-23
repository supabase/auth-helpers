import { NextResponse } from 'next/server';
import { NextMiddleware } from 'next/server';
import {
  CookieOptions,
  createServerSupabaseClient
} from '@supabase/auth-helpers-shared';
import { User } from '@supabase/supabase-js';

class NoPermissionError extends Error {
  constructor(message: string) {
    super(message);
  }
  get name() {
    return this.constructor.name;
  }
}

export interface withMiddlewareAuthOptions {
  /**
   * Path relative to the site root to redirect an
   * unauthenticated visitor.
   *
   * The original request route will be appended via
   * a `redirectedFrom` query parameter, ex: `?redirectedFrom=%2Fdashboard`
   */
  redirectTo?: string;
  cookieOptions?: CookieOptions;
  authGuard?: {
    isPermitted: (user: User) => Promise<boolean>;
    redirectTo: string;
  };
}
export type withMiddlewareAuth = (
  options?: withMiddlewareAuthOptions
) => NextMiddleware;

export const withMiddlewareAuth: withMiddlewareAuth =
  (options: withMiddlewareAuthOptions = {}) =>
  async (req) => {
    try {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        throw new Error(
          'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables are required!'
        );
      }

      const res = NextResponse.next();

      const supabase = createServerSupabaseClient({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        getRequestHeader: (key) => req.headers.get(key) ?? undefined,
        getResponseHeader: (key) => res.headers.get(key) ?? undefined,
        setHeader: (key, value) => {
          if (Array.isArray(value)) {
            value.forEach((v) => res.headers.append(key, v));
          } else {
            res.headers.set(key, value);
          }
        },
        cookieOptions: options.cookieOptions
      });

      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error) {
        throw new Error(
          `Authorization error, redirecting to login page: ${error.message}`
        );
      } else if (!session) {
        throw new Error('No auth session, redirecting');
      } else if (
        options.authGuard &&
        !(await options.authGuard.isPermitted(session.user))
      ) {
        throw new NoPermissionError('User is not permitted, redirecting');
      }

      // Authentication successful, forward request to protected route
      return res;
    } catch (err: unknown) {
      let { redirectTo = '/' } = options;
      if (
        err instanceof NoPermissionError &&
        !!options?.authGuard?.redirectTo
      ) {
        redirectTo = options.authGuard.redirectTo;
      }
      if (err instanceof Error) {
        console.log(
          `Could not authenticate request, redirecting to ${redirectTo}:`,
          err
        );
      }
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = redirectTo;
      redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
      // Authentication failed, redirect request
      return NextResponse.redirect(redirectUrl);
    }
  };
