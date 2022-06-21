import type { Handle } from '@sveltejs/kit';
import {
  setCookies,
  COOKIE_OPTIONS,
  type CookieOptions,
  SvelteKitRequestAdapter,
  SvelteKitResponseAdapter
} from '@supabase/auth-helpers-shared';
import { getUser, saveTokens } from '../utils/getUser';

export interface HandleCallbackOptions {
  cookieOptions?: CookieOptions;
}

type AuthCookies = Parameters<typeof setCookies>[2];

export const handleCallback = (options: HandleCallbackOptions = {}) => {
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

    const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
    const { event: bodyEvent, session } = await req.json();

    if (!bodyEvent) throw new Error('Auth event missing!');
    if (bodyEvent === 'USER_UPDATED') {
      const session = await getUser(req, { forceRefresh: true });
      await saveTokens({ req, res }, session, { forceRefresh: true })
    }
    if (bodyEvent === 'SIGNED_IN') {
      if (!session) throw new Error('Auth session missing!');
      setCookies(
        new SvelteKitRequestAdapter(req),
        new SvelteKitResponseAdapter(res),
        [
          session.access_token
            ? { key: 'access-token', value: session.access_token }
            : null,
          session.refresh_token
            ? { key: 'refresh-token', value: session.refresh_token }
            : null,
          session.provider_token
            ? { key: 'provider-token', value: session.provider_token }
            : null
        ].reduce<AuthCookies>((acc, token) => {
          if (token) {
            acc.push({
              name: `${cookieOptions.name}-${token.key}`,
              value: token.value,
              domain: cookieOptions.domain,
              maxAge: cookieOptions.lifetime ?? 0,
              path: cookieOptions.path,
              sameSite: cookieOptions.sameSite
            })
          }
          return acc;
        }, [])
      );
    }

    if (bodyEvent === 'SIGNED_OUT' || bodyEvent === 'USER_DELETED') {
      setCookies(
        new SvelteKitRequestAdapter(req),
        new SvelteKitResponseAdapter(res),
        ['access-token', 'refresh-token', 'provider-token'].map((key) => ({
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
