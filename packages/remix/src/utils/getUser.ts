import { User, createClient } from '@supabase/supabase-js';
import {
  ApiError,
  CookieOptions,
  TOKEN_REFRESH_MARGIN,
  jwtDecoder
} from '@supabase/auth-helpers-shared';
import { getSession, commitSession } from './cookies';
import { DataFunctionArgsWithResponse } from '../handlers/auth';

export interface GetUserOptions {
  cookieOptions?: CookieOptions;
  forceRefresh?: boolean;
  tokenRefreshMargin?: number;
}

export default async function getUser(
  context: DataFunctionArgsWithResponse,
  options: GetUserOptions = { forceRefresh: false }
): Promise<{ user: User | null; accessToken: string | null; error?: string }> {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY env variables are required!'
      );
    }
    if (!context.request.headers.get('Cookie')) {
      throw new Error('Not able to parse cookies!');
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const tokenRefreshMargin =
      options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
    const session = await getSession(context.request.headers.get('Cookie'));
    const access_token = session.get('accessToken');
    const refresh_token = session.get('refreshToken');

    if (!access_token) {
      throw new Error('No cookie found!');
    }

    // Get payload from access token.
    const jwtUser = jwtDecoder(access_token);
    if (!jwtUser?.exp) {
      throw new Error('Not able to parse JWT payload!');
    }

    const timeNow = Math.round(Date.now() / 1000);
    if (options.forceRefresh || jwtUser.exp < timeNow + tokenRefreshMargin) {
      // JWT is expired, let's refresh from Gotrue
      if (!refresh_token) throw new Error('No refresh_token cookie found!');
      const { data, error } = await supabase.auth.api.refreshAccessToken(
        refresh_token
      );
      if (error) {
        throw error;
      } else {
        const session = await getSession();
        session.set('accessToken', data!.access_token);
        session.set('refreshToken', data!.refresh_token);
        const cookie = await commitSession(session);
        context.response.headers.set('Set-Cookie', cookie);
        return { user: data!.user!, accessToken: data!.access_token };
      }
    } else {
      const { user, error: getUserError } = await supabase.auth.api.getUser(
        access_token
      );
      if (getUserError) {
        throw getUserError;
      }
      return { user: user!, accessToken: access_token };
    }
  } catch (e) {
    const error = e as ApiError;
    console.log('Error getting user:', error);
    return { user: null, accessToken: null, error: error.message };
  }
}
