import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { skHelper } from '../instance';
import {
  jwtDecoder,
  setCookies,
  parseCookie,
  COOKIE_OPTIONS,
  type CookieOptions,
  SvelteKitRequestAdapter,
  SvelteKitResponseAdapter
} from '../types';

interface RequestResponse {
  req: Request;
  res: Response;
}

export default async function getUser(
  { req, res }: RequestResponse,
  cookieOptions: CookieOptions = COOKIE_OPTIONS
): Promise<{ user: User | null; accessToken: string | null }> {
  try {
    const {
      apiInfo: { supabaseUrl, supabaseAnonKey }
    } = skHelper();
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'supabaseUrl and supabaseAnonKey env variables are required!'
      );
    }

    if (!req.headers.has('cookie')) {
      throw new Error('Cookie not found!');
    }

    const cookies = parseCookie(req.headers.get('cookie'));

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const access_token = cookies[`${cookieOptions.name}-access-token`];
    const refresh_token = cookies[`${cookieOptions.name}-refresh-token`];

    if (!access_token) {
      throw new Error('No cookie found!');
    }

    // if we have a token, set the client to use it so we can make authorized requests to Supabase
    supabase.auth.setAuth(access_token);

    // Get payload from access token.
    const jwtUser = jwtDecoder(access_token);
    if (!jwtUser?.exp) {
      throw new Error('Not able to parse JWT payload!');
    }
    const timeNow = Math.round(Date.now() / 1000);
    if (jwtUser.exp < timeNow) {
      // JWT is expired, let's refresh from Gotrue
      if (!refresh_token) {
        throw new Error('No refresh_token cookie found!');
      }

      const { data, error } = await supabase.auth.api.refreshAccessToken(
        refresh_token
      );

      if (error) {
        throw error;
      }

      setCookies(
        new SvelteKitRequestAdapter(req),
        new SvelteKitResponseAdapter(res),
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
      return { user: data!.user!, accessToken: data!.access_token };
    } else {
      const { user, error: getUserError } = await supabase.auth.api.getUser(
        access_token
      );
      if (getUserError) {
        throw getUserError;
      }
      return { user, accessToken: access_token };
    }
  } catch (e) {
    return { user: null, accessToken: null };
  }
}
