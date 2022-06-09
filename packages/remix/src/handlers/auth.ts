import {
  CookieOptions,
  COOKIE_OPTIONS,
  TOKEN_REFRESH_MARGIN
} from '@supabase/auth-helpers-shared';
import handleCallback from './callback';
import handleUser from './user';
import handleLogout from './logout';
import { DataFunctionArgs } from '@remix-run/server-runtime';

export type DataFunctionArgsWithResponse = DataFunctionArgs & {
  response: Response;
};

export interface HandleAuthOptions {
  cookieOptions?: CookieOptions;
  logout?: { returnTo?: string };
  tokenRefreshMargin?: number;
}

export default function handleAuth(options: HandleAuthOptions = {}) {
  return async (context: DataFunctionArgs): Promise<Response> => {
    const { logout } = options;
    const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
    const tokenRefreshMargin =
      options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
    const route = context.params['*'];
    const response = new Response();
    const contextWithResponse: DataFunctionArgsWithResponse = {
      ...context,
      response
    };

    switch (route) {
      case 'callback':
        return handleCallback(contextWithResponse, {
          cookieOptions
        });
      case 'user':
        return await handleUser(contextWithResponse, {
          cookieOptions,
          tokenRefreshMargin
        });
      case 'logout':
        return handleLogout(contextWithResponse, {
          cookieOptions,
          ...logout
        });
      default:
        return new Response('Not found', {
          status: 404
        });
    }
  };
}
