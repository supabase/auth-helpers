import { NextResponse } from 'next/server';
import { NextMiddleware } from 'next/server';
import {
  CookieOptions,
  createServerSupabaseClient,
  parseCookies,
  serializeCookie
} from '@supabase/auth-helpers-shared';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { PKG_NAME, PKG_VERSION } from '../constants';

class NoPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoPermissionError';
  }
}

/**
 * @deprecated Use `createMiddlewareSupabaseClient` instead. See the [docs](https://github.com/supabase/auth-helpers/blob/main/packages/nextjs/MIGRATION_GUIDE.md#migrating-to-05x) for examples.
 */
export const withMiddlewareAuth =
  <
    Database = any,
    SchemaName extends string & keyof Database = 'public' extends keyof Database
      ? 'public'
      : string & keyof Database
  >(
    options: {
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
        isPermitted: (
          user: User,
          supabase: SupabaseClient<Database, SchemaName>
        ) => Promise<boolean>;
        redirectTo: string;
      };
    } = {}
  ): NextMiddleware =>
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

      const supabase = createServerSupabaseClient<Database, SchemaName>({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        getCookie(name) {
          const cookies = parseCookies(req.headers.get('cookie') ?? '');
          return cookies[name];
        },
        setCookie(name, value, options) {
          const newSessionStr = serializeCookie(name, value, {
            ...options,
            // Allow supabase-js on the client to read the cookie as well
            httpOnly: false
          });
          res.headers.append(name, newSessionStr);
        },
        getRequestHeader: (key) => {
          const header = req.headers.get(key) ?? undefined;

          return header;
        },
        options: {
          global: {
            headers: {
              'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
            }
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
        !(await options.authGuard.isPermitted(session.user, supabase))
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
