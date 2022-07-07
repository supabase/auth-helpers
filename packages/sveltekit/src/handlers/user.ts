import type { Handle } from '@sveltejs/kit';
import { ENDPOINT_PREFIX } from '@supabase/auth-helpers-shared';
import logger from '../utils/log';

export interface HandleUserOptions {
  endpointPrefix?: string;
}

export const handleUser = (options: HandleUserOptions = {}) => {
  const endpointPath = `${options.endpointPrefix ?? ENDPOINT_PREFIX}/user`;

  const user: Handle = async ({ event, resolve }) => {
    const req = event.request;
    const res = await resolve(event);

    // if not a user route return
    if (event.url.pathname !== endpointPath) {
      return res;
    }

    // user implemented the route, warn
    if (res.status !== 405) {
      logger.warn(
        `@supabase/auth-helpers-sveltekit handles the route '${endpointPath}'`
      );
    }

    // check request method
    if (req.method !== 'GET') {
      const headers = new Headers({
        Allow: 'GET'
      });
      return new Response('Method Not Allowed', { headers, status: 405 });
    }

    const { user, accessToken, error } = event.locals;
    const body = { user, accessToken, error };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return user;
};
