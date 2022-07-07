import type { Handle } from '@sveltejs/kit';
import {
  setCookies,
  COOKIE_OPTIONS,
  type CookieOptions,
  parseCookie,
  SvelteKitRequestAdapter,
  SvelteKitResponseAdapter
} from '@supabase/auth-helpers-shared';
import { skHelper } from '../instance';
import { deleteTokens } from '../utils/deleteTokens';

export interface HandleOptions {
  cookieOptions?: CookieOptions;
  returnTo?: string;
}

export const handleLogout = (options: HandleOptions = {}) => {
  const handle: Handle = async ({ event, resolve }) => {
    const req = event.request;
    let res = await resolve(event);
    const { supabaseClient } = skHelper();

    // if not a callback route return
    if (event.url.pathname === '/api/auth/logout') {
      if (req.method !== 'GET') {
        const headers = new Headers({
          Allow: 'GET'
        });
        return new Response('Method Not Allowed', { headers, status: 405 });
      }

      let returnTo = options?.returnTo ?? '/';
      returnTo = returnTo.startsWith('/') ? returnTo : `/${returnTo}`
      const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };

      // Logout request to Gotrue
      const cookies = parseCookie(req.headers.get('cookie'));
      const access_token = cookies[`${cookieOptions.name}-access-token`];
      if (access_token) supabaseClient?.auth.api.signOut(access_token);

      deleteTokens({ req, res }, cookieOptions.name);

      const headers = new Headers(res.headers);
      headers.set('Location', returnTo);
      return new Response(null, { status: 303, headers });
    }

    return res;
  };

  return handle;
};

