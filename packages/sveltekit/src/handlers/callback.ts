import type { Handle } from '@sveltejs/kit';
import {
  setCookies,
  COOKIE_OPTIONS,
  type CookieOptions,
  SvelteKitRequestAdapter,
  SvelteKitResponseAdapter
} from '../types';

export const handleCallback = (
  cookieOptions: CookieOptions = COOKIE_OPTIONS
) => {
  const handle: Handle = async ({ event, resolve }) => {
    const req = event.request;
    let res = await resolve(event);

    // if not a callback route return
    if (event.url.pathname !== '/api/auth/callback') {
      return res;
    }

    if (req.method !== 'POST') {
      const headers = new Headers({
        Allow: 'POST'
      });
      return new Response('Method Not Allowed', { headers, status: 405 });
    }

    const { event: bodyEvent, session } = await req.json();

    if (!bodyEvent) throw new Error('Auth event missing!');
    if (bodyEvent === 'SIGNED_IN') {
      if (!session) throw new Error('Auth session missing!');
      setCookies(
        new SvelteKitRequestAdapter(req),
        new SvelteKitResponseAdapter(res),
        [
          { key: 'access-token', value: session.access_token },
          { key: 'refresh-token', value: session.refresh_token }
        ].map((token) => ({
          name: `${cookieOptions.name}-${token.key}`,
          value: token.value,
          domain: cookieOptions.domain,
          maxAge: cookieOptions.lifetime ?? 0,
          path: cookieOptions.path,
          sameSite: cookieOptions.sameSite
        }))
      );
    }

    if (bodyEvent === 'SIGNED_OUT') {
      setCookies(
        new SvelteKitRequestAdapter(req),
        new SvelteKitResponseAdapter(res),
        ['access-token', 'refresh-token'].map((key) => ({
          name: `${cookieOptions.name}-${key}`,
          value: '',
          maxAge: -1
        }))
      );
    }

    return res;
  };

  return handle;
};
