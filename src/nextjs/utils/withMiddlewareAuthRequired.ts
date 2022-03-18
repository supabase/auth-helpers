import { NextResponse } from 'next/server';
import { NextMiddleware } from 'next/server';
import { User, ApiError, createClient } from '@supabase/supabase-js';
import { CookieOptions } from '../types';
import { COOKIE_OPTIONS } from '../../shared/utils/constants';
import { jwtDecoder } from '../../shared/utils/jwt';

export type WithMiddlewareAuthRequired = (options?: {
  /**
   * Path relative to the site root to redirect an
   * unauthenticated visitor.
   *
   * The original request route will be appended via
   * a `ret` query parameter, ex: `?ret=%2Fdashboard`
   */
  redirectTo?: string;
  cookieOptions?: CookieOptions;
}) => NextMiddleware;

export const withMiddlewareAuthRequired: WithMiddlewareAuthRequired =
  ({ redirectTo = '/', cookieOptions = COOKIE_OPTIONS } = {}) =>
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
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const access_token = req.cookies[`${cookieOptions.name!}-access-token`];
      const refresh_token = req.cookies[`${cookieOptions.name!}-refresh-token`];

      const getUser = async (): Promise<{
        user: User | null;
        error: ApiError | null;
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
        if (jwtUser.exp < timeNow) {
          if (!refresh_token) {
            throw new Error('No refresh_token cookie found!');
          }
          const res = await supabase.auth.api.refreshAccessToken(refresh_token);
          return { user: res.data?.user ?? null, error: res.error };
        }
        const res = await supabase.auth.api.getUser(access_token);
        return { user: res.user, error: res.error };
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
      return NextResponse.next();
    } catch (err: unknown) {
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
