import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { getServerConfig } from '../config';
import { deleteSession, saveSession } from '../helpers';

interface PostBody {
  event: AuthChangeEvent;
  session: Session | null;
}

export async function handleCallbackSession({
  cookies,
  request
}: RequestEvent) {
  const { event: sessionEvent, session }: PostBody = await request.json();

  if (sessionEvent === 'SIGNED_IN' && session) {
    saveSession(cookies, session);
  } else if (sessionEvent === 'SIGNED_OUT') {
    deleteSession(cookies);
  }

  return new Response(null, { status: 204 });
}

export default function callback(): Handle {
  const { endpointPrefix } = getServerConfig();
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
