import { NextResponse } from 'next/server';
import { NextMiddleware } from 'next/server';
import {
  CookieOptions,
  setCookies,
  COOKIE_OPTIONS,
  TOKEN_REFRESH_MARGIN,
  NextRequestMiddlewareAdapter,
  NextResponseMiddlewareAdapter,
  jwtDecoder,
  User
} from '@supabase/auth-helpers-shared';
import UrlPattern from 'url-pattern';

class NoPermissionError extends Error {
  constructor(message: string) {
    super(message);
  }
  get name() { return this.constructor.name }
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
  matcher: string[];
  cookieOptions?: CookieOptions;
  tokenRefreshMargin?: number;
  authGuard?: {
    isPermitted: (user: User) => Promise<boolean>;
    redirectTo: string;
  };
}
export type withMiddlewareAuth = (
  options?: withMiddlewareAuthOptions[]
) => NextMiddleware;

export const withMiddlewareAuth: withMiddlewareAuth =
  (options: withMiddlewareAuthOptions[] = []) =>
  async (req) => {
    const routeSpecificOptions = options.find(config => {
      for (const matcher of config.matcher) {
        var pattern = new UrlPattern(matcher);
        if (pattern.match(req.nextUrl.pathname)) return true;
      }
    });
    // there is no option matching the current path, proceed.
    if (!routeSpecificOptions) return NextResponse.next();

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
      const cookieOptions = { ...COOKIE_OPTIONS, ...routeSpecificOptions.cookieOptions };
      const tokenRefreshMargin =
        routeSpecificOptions.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
      const access_token = req.cookies.get(`${cookieOptions.name!}-access-token`);
      const refresh_token = req.cookies.get(`${cookieOptions.name!}-refresh-token`);

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
            new NextResponseMiddlewareAdapter(NextResponse.next()),
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
      } else if (
        routeSpecificOptions.authGuard &&
        !(await routeSpecificOptions.authGuard.isPermitted(authResult.user))
      ) {
        throw new NoPermissionError('User is not permitted, redirecting');
      }

      // Authentication successful, forward request to protected route
      return NextResponse.next();
    } catch (err: unknown) {
      let { redirectTo = '/' } = routeSpecificOptions;
      if (
        err instanceof NoPermissionError &&
        !!routeSpecificOptions?.authGuard?.redirectTo
      ) {
        redirectTo = routeSpecificOptions.authGuard.redirectTo;
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
