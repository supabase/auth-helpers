import { NextResponse } from 'next/server';
import { NextMiddleware } from 'next/server';
import { CookieOptions } from '@supabase/auth-helpers-shared';
import { COOKIE_OPTIONS, TOKEN_REFRESH_MARGIN } from '@supabase/auth-helpers-shared';
import { setCookies } from '@supabase/auth-helpers-shared';
import { jwtDecoder } from '../utils/jwt';
import {
  NextRequestMiddlewareAdapter,
  NextResponseMiddlewareAdapter
} from '@supabase/auth-helpers-shared';

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
  tokenRefreshMargin?: number;
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
      if (!req.cookies) {
        throw new Error('Not able to parse cookies!');
      }
      const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
      const tokenRefreshMargin =
        options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
      const access_token = req.cookies[`${cookieOptions.name!}-access-token`];
      const refresh_token = req.cookies[`${cookieOptions.name!}-refresh-token`];

      const res = NextResponse.next();

      const getUser = async (): Promise<{
        user: any;
        error: any;
      }> => {
        if (!access_token) {
          throw new Error('No cookie found!');
        }
        // Get payload from access token.
        const jwtUser = jwtDecoder(access_token);
        if (!jwtUser?.exp) {
          throw new Error('Not able to parse JWT payload!');
        }
        const timeNow = Math.round(Date.now() / 1000);
        if (jwtUser.exp < timeNow + tokenRefreshMargin) {
          if (!refresh_token) {
            throw new Error('No refresh_token cookie found!');
          }
          const requestHeaders: HeadersInit = new Headers();
          requestHeaders.set('accept', 'json');
          requestHeaders.set(
            'apiKey',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          requestHeaders.set(
            'authorization',
            `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          );

          const data = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
            {
              method: 'POST',
              headers: requestHeaders,
              body: JSON.stringify({ refresh_token })
            }
          )
            .then((res) => res.json())
            .catch((e) => ({
              error: String(e)
            }));
          setCookies(
            new NextRequestMiddlewareAdapter(req),
            new NextResponseMiddlewareAdapter(res),
            [
              { key: 'access-token', value: data!.access_token },
              { key: 'refresh-token', value: data!.refresh_token! }
            ].map((token) => ({
              name: `${cookieOptions.name}-${token.key}`,
              value: token.value,
              domain: cookieOptions.domain,
              maxAge: cookieOptions.lifetime ?? 0,
              path: cookieOptions.path,
              sameSite: cookieOptions.sameSite
            }))
          );
          return { user: data?.user ?? null, error: data?.error };
        }
        return { user: jwtUser, error: null };
      };

      const authResult = await getUser();

      if (authResult.error) {
        throw new Error(
          `Authorization error, redirecting to login page: ${authResult.error.message}`
        );
      } else if (!authResult.user) {
        throw new Error('No auth user, redirecting');
      }

      // Authentication successful, forward request to protected route
      return res;
    } catch (err: unknown) {
      const { redirectTo = '/' } = options;
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
