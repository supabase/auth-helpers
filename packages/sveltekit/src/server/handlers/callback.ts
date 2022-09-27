import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { getConfig } from '../../config.js';
import { deleteSession, saveSession } from '../utils/cookies.js';

interface PostBody {
  event: AuthChangeEvent;
  session: Session | null;
}

/**
 * A `RequestHandler` that receives the client session and saves it in cookies.
 *
 * @example
 * // src/routes/api/auth/callback/+server.js
 * export const POST = handleCallbackSession;
 */
export async function handleCallbackSession({
  cookies,
  request
}: RequestEvent) {
  const { event: sessionEvent, session }: PostBody = await request.json();

  const response = new Response(null, { status: 204 });
  response.headers.set('Cache-Control', 'no-store');

  if (sessionEvent === 'SIGNED_IN' && session) {
    saveSession(cookies, session, response);
  } else if (sessionEvent === 'SIGNED_OUT') {
    deleteSession(cookies, response);
  }

  return response;
}

/**
 * Creates the callback endpoint that receives the client session and saves it in cookies.
 *
 * If you prefer defining the endpoint in a file use `handleCallbackSession` instead
 *
 * @example
 * // src/hooks.server.ts
 * export const handle = callback();
 * export const handle = sequence(callback(), ...);
 */
export function callback(): Handle {
  const { endpointPrefix } = getConfig();
  const endpointPath = `${endpointPrefix}/callback`;

  return async ({ resolve, event }) => {
    if (event.url.pathname !== endpointPath) {
      return resolve(event);
    }

    if (event.request.method !== 'POST') {
      const headers = new Headers({
        Allow: 'POST'
      });
      return new Response('Method Not Allowed', { headers, status: 405 });
    }

    return handleCallbackSession(event);
  };
}
